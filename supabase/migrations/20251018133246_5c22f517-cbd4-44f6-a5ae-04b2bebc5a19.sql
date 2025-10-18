-- CRITICAL FIX: Complete User Invitation System Fix
-- This migration addresses 5 critical issues:
-- 1. Ensures parent_account_id is NEVER NULL for non-owner users
-- 2. Fixes the existing broken user's parent_account_id
-- 3. Updates curtain_templates RLS policies for account-level access
-- 4. Adds validation trigger to prevent orphaned users
-- 5. Ensures proper role assignment on invitation acceptance

-- Step 1: Fix the existing broken user's parent_account_id
UPDATE user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
WHERE user_id = '4cd6cae9-d717-465d-84c4-48ba05ed227f'
  AND (parent_account_id IS NULL OR parent_account_id = user_id);

-- Step 2: Drop and recreate accept_user_invitation to GUARANTEE parent_account_id is never NULL
DROP FUNCTION IF EXISTS public.accept_user_invitation(text, uuid);

CREATE FUNCTION public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invitation_record record;
    inviter_id uuid;
    account_owner_id uuid;
    perm text;
    result jsonb;
    perms_to_seed text[];
    permissions_inserted int := 0;
    profile_created boolean := false;
BEGIN
    RAISE LOG 'accept_user_invitation: Starting acceptance for token % and user %', invitation_token_param, user_id_param;
    
    -- Fetch invitation (pending & not expired)
    SELECT * INTO invitation_record
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::uuid
      AND status = 'pending'
      AND expires_at > now();

    IF NOT FOUND THEN
        RAISE LOG 'accept_user_invitation: No pending invitation found for token %', invitation_token_param;
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    RAISE LOG 'accept_user_invitation: Found invitation for % by %', invitation_record.invited_email, invitation_record.invited_by_email;

    -- Resolve inviter id (by email) and their account owner
    SELECT id INTO inviter_id FROM auth.users WHERE email = invitation_record.invited_by_email LIMIT 1;
    IF inviter_id IS NULL THEN
        inviter_id := invitation_record.user_id;
    END IF;
    
    -- Get the account owner from the inviter
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    
    -- CRITICAL FIX: If inviter has no parent, they ARE the account owner
    IF account_owner_id IS NULL OR account_owner_id = inviter_id THEN
        account_owner_id := inviter_id;
    END IF;
    
    -- CRITICAL SAFETY CHECK: Never allow the new user to be their own parent
    IF account_owner_id = user_id_param THEN
        RAISE LOG 'accept_user_invitation: ERROR - Attempted to set user % as their own parent. Using inviter % instead.', user_id_param, inviter_id;
        account_owner_id := inviter_id;
    END IF;
    
    -- FINAL VALIDATION: account_owner_id must never be NULL
    IF account_owner_id IS NULL THEN
        RAISE EXCEPTION 'CRITICAL ERROR: Could not determine account owner for invitation acceptance';
    END IF;

    RAISE LOG 'accept_user_invitation: Inviter %, Account owner %', inviter_id, account_owner_id;

    -- Create or update user profile with proper linking
    INSERT INTO public.user_profiles (
        user_id,
        display_name,
        role,
        is_active,
        parent_account_id,
        created_at,
        updated_at
    ) VALUES (
        user_id_param,
        COALESCE(invitation_record.invited_name, invitation_record.invited_email),
        invitation_record.role,
        true,
        account_owner_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = invitation_record.role,
        is_active = true,
        parent_account_id = EXCLUDED.parent_account_id,
        display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
        updated_at = NOW();

    profile_created := true;
    RAISE LOG 'accept_user_invitation: Profile created/updated for user % with parent %', user_id_param, account_owner_id;

    -- Clear existing permissions first to ensure clean state
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

    -- Handle permissions seeding
    perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
    IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (user_id_param, perm, inviter_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_inserted := permissions_inserted + 1;
        END LOOP;
        RAISE LOG 'accept_user_invitation: Seeded % role-based permissions for user %', permissions_inserted, user_id_param;
    END IF;

    -- Mark invitation accepted
    UPDATE public.user_invitations
      SET status = 'accepted', updated_at = NOW()
      WHERE invitation_token = invitation_token_param::uuid;

    RAISE LOG 'accept_user_invitation: Marked invitation accepted for token %', invitation_token_param;

    RETURN jsonb_build_object(
      'success', true,
      'role', invitation_record.role,
      'permissions_inserted_count', permissions_inserted,
      'parent_account_id', account_owner_id,
      'inviter_id', inviter_id,
      'profile_created', profile_created
    );
END;
$$;

-- Step 3: Add validation trigger to prevent orphaned users
CREATE OR REPLACE FUNCTION public.validate_user_profile_parent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'Owner' THEN
    RETURN NEW;
  END IF;
  
  IF NEW.parent_account_id IS NULL THEN
    RAISE EXCEPTION 'Non-owner users must have a valid parent_account_id. User role: %', NEW.role;
  END IF;
  
  IF NEW.parent_account_id = NEW.user_id THEN
    RAISE EXCEPTION 'Users cannot be their own parent. User: %, Parent: %', NEW.user_id, NEW.parent_account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_profile_parent_trigger ON public.user_profiles;

CREATE TRIGGER validate_user_profile_parent_trigger
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_user_profile_parent();

-- Step 4: Fix curtain_templates RLS policies for account-level access
DROP POLICY IF EXISTS "Users can view curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can create curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can update curtain templates" ON public.curtain_templates;
DROP POLICY IF EXISTS "Users can delete curtain templates" ON public.curtain_templates;

CREATE POLICY "Users can view curtain templates" ON public.curtain_templates
FOR SELECT USING (
  (is_system_default = true AND active = true)
  OR auth.uid() = user_id
  OR public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
  OR public.is_admin()
);

CREATE POLICY "Users can create curtain templates" ON public.curtain_templates
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can update curtain templates" ON public.curtain_templates
FOR UPDATE USING (
  auth.uid() = user_id
  OR public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
  OR public.is_admin()
);

CREATE POLICY "Users can delete curtain templates" ON public.curtain_templates
FOR DELETE USING (
  auth.uid() = user_id
  OR public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
  OR public.is_admin()
);