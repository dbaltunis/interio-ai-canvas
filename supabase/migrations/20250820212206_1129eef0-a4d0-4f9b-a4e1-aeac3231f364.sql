-- Fix invitation system - Phase 1: Database Functions

-- 1. Fix the accept_user_invitation function to properly handle all cases
CREATE OR REPLACE FUNCTION public.accept_user_invitation(
  invitation_token_param text, 
  user_id_param uuid
)
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
    -- Log the start of invitation acceptance
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
        parent_account_id = account_owner_id, -- Always update parent_account_id
        display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
        updated_at = NOW();

    profile_created := true;
    RAISE LOG 'accept_user_invitation: Profile created/updated for user %', user_id_param;

    -- Clear existing permissions first to ensure clean state
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

    -- Handle permissions seeding with proper column reference
    IF invitation_record.permissions IS NOT NULL AND jsonb_typeof(invitation_record.permissions) = 'object' THEN
      -- Use explicit permissions from invitation (as object)
      FOR perm IN SELECT key FROM jsonb_each(invitation_record.permissions) WHERE value::boolean = true
      LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, created_by)
        VALUES (user_id_param, perm, inviter_id)
        ON CONFLICT DO NOTHING;
        permissions_inserted := permissions_inserted + 1;
      END LOOP;
      RAISE LOG 'accept_user_invitation: Seeded % object permissions for user %', permissions_inserted, user_id_param;
    ELSIF invitation_record.permissions IS NOT NULL AND jsonb_typeof(invitation_record.permissions) = 'array' THEN
      -- Use explicit permissions from invitation (as array)
      FOR perm IN SELECT jsonb_array_elements_text(invitation_record.permissions)
      LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, created_by)
        VALUES (user_id_param, perm, inviter_id)
        ON CONFLICT DO NOTHING;
        permissions_inserted := permissions_inserted + 1;
      END LOOP;
      RAISE LOG 'accept_user_invitation: Seeded % array permissions for user %', permissions_inserted, user_id_param;
    ELSE
      -- Seed defaults based on role when invitation had no explicit permissions
      perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
      IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
          INSERT INTO public.user_permissions (user_id, permission_name, created_by)
          VALUES (user_id_param, perm, inviter_id)
          ON CONFLICT DO NOTHING;
          permissions_inserted := permissions_inserted + 1;
        END LOOP;
        RAISE LOG 'accept_user_invitation: Seeded % default role permissions for user %', permissions_inserted, user_id_param;
      END IF;
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

-- 2. Create a helper function to manually fix users who are already signed up but not processed
CREATE OR REPLACE FUNCTION public.fix_pending_invitations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invitation_record record;
    user_record record;
    results jsonb := '[]'::jsonb;
    fix_result jsonb;
BEGIN
    -- Find all pending invitations where the user already exists
    FOR invitation_record IN 
        SELECT ui.*, au.id as existing_user_id
        FROM public.user_invitations ui
        JOIN auth.users au ON au.email = ui.invited_email
        WHERE ui.status = 'pending'
          AND ui.expires_at > NOW()
    LOOP
        -- Auto-accept this invitation
        SELECT public.accept_user_invitation(
            invitation_record.invitation_token::text,
            invitation_record.existing_user_id
        ) INTO fix_result;
        
        results := results || jsonb_build_object(
            'email', invitation_record.invited_email,
            'token', invitation_record.invitation_token,
            'result', fix_result
        );
    END LOOP;
    
    RETURN jsonb_build_object('fixed_invitations', results);
END;
$$;