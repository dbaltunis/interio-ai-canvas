-- Remove hardcoded user references and ensure generic functionality

-- Update the accept_user_invitation function to properly handle Manager role permissions
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
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
$$;

-- Create a generic function to fix any existing users with incomplete permissions
CREATE OR REPLACE FUNCTION public.fix_user_permissions_for_role(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_role text;
    expected_perms text[];
    existing_perms text[];
    missing_perms text[];
    perm text;
    permissions_added int := 0;
    inviter_id uuid;
BEGIN
    -- Get user's role and parent account
    SELECT role, parent_account_id INTO user_role, inviter_id
    FROM public.user_profiles 
    WHERE user_id = target_user_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Get expected permissions for role
    expected_perms := public.get_default_permissions_for_role(user_role);
    
    -- Get existing permissions
    SELECT array_agg(permission_name) INTO existing_perms
    FROM public.user_permissions 
    WHERE user_id = target_user_id;
    
    existing_perms := COALESCE(existing_perms, ARRAY[]::text[]);
    
    -- Find missing permissions
    SELECT array_agg(perm) INTO missing_perms
    FROM unnest(expected_perms) AS perm
    WHERE perm != ALL(existing_perms);
    
    missing_perms := COALESCE(missing_perms, ARRAY[]::text[]);
    
    -- Add missing permissions
    FOREACH perm IN ARRAY missing_perms LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
        VALUES (target_user_id, perm, inviter_id)
        ON CONFLICT (user_id, permission_name) DO NOTHING;
        permissions_added := permissions_added + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_role', user_role,
        'expected_permissions', expected_perms,
        'existing_permissions', existing_perms,
        'missing_permissions', missing_perms,
        'permissions_added', permissions_added
    );
END;
$$;