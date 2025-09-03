-- Fix invitation acceptance and team member linking

-- First, let's update the accept_user_invitation function to properly link users
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        inviter_id := invitation_record.user_id; -- fallback to invitation creator
    END IF;
    
    -- Get the account owner from the inviter
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    
    -- If inviter is the account owner, use their ID directly
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id;
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
        parent_account_id = account_owner_id,
        display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
        updated_at = NOW();

    profile_created := true;
    RAISE LOG 'accept_user_invitation: Profile created/updated for user %', user_id_param;

    -- Clear existing permissions first to ensure clean state
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

    -- Handle permissions seeding - always use role-based defaults for consistency
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
$function$;

-- Fix existing broken team members by linking them to proper account owners
-- First, let's identify users who should be linked to account owner ec930f73-ef23-4430-921f-1b401859825d
UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
WHERE user_id IN (
  '5b090e31-e15e-4e10-8fca-79456bf4c165', -- User Testing
  '052a90f1-3a0f-4c30-af56-08b2fd775ee3', -- darius+evelina@curtainscalculator.com  
  'b964e017-84c9-462e-9996-6b402ff892f5', -- kparamo.work@gmail.com
  '47c48298-7d79-4671-ae16-3ec873e31847'  -- darius+sms@curtainscalculator.com
) AND parent_account_id IS NULL;

-- Ensure the account owner's parent_account_id points to themselves
UPDATE public.user_profiles 
SET parent_account_id = user_id
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d' 
AND (parent_account_id IS NULL OR parent_account_id != user_id);

-- Now seed default permissions for all users based on their roles
DO $$
DECLARE
    user_record record;
    expected_perms text[];
    perm text;
BEGIN
    FOR user_record IN 
        SELECT user_id, role, parent_account_id
        FROM public.user_profiles 
        WHERE role IS NOT NULL
    LOOP
        -- Clear existing permissions
        DELETE FROM public.user_permissions WHERE user_id = user_record.user_id;
        
        -- Get expected permissions for role
        expected_perms := public.get_default_permissions_for_role(user_record.role);
        
        -- Add permissions
        IF expected_perms IS NOT NULL THEN
            FOREACH perm IN ARRAY expected_perms LOOP
                INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                VALUES (user_record.user_id, perm, user_record.parent_account_id)
                ON CONFLICT (user_id, permission_name) DO NOTHING;
            END LOOP;
        END IF;
        
        RAISE LOG 'Seeded permissions for user % with role %', user_record.user_id, user_record.role;
    END LOOP;
END $$;