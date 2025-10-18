-- FIX: Ensure accept_user_invitation ALWAYS uses the invitation role, never defaults to anything else

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

    RAISE LOG 'accept_user_invitation: Found invitation for % by % with role %', invitation_record.invited_email, invitation_record.invited_by_email, invitation_record.role;

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

    RAISE LOG 'accept_user_invitation: Inviter %, Account owner %, Role from invitation: %', inviter_id, account_owner_id, invitation_record.role;

    -- CRITICAL FIX: Update user profile with EXACT role from invitation
    -- Use UPDATE instead of INSERT...ON CONFLICT to ensure we're modifying the existing profile
    UPDATE public.user_profiles 
    SET 
        role = invitation_record.role,  -- ALWAYS use invitation role, never default to anything else
        is_active = true,
        parent_account_id = account_owner_id,
        display_name = COALESCE(display_name, invitation_record.invited_name, invitation_record.invited_email),
        updated_at = NOW()
    WHERE user_id = user_id_param;

    -- Check if update affected any rows
    IF NOT FOUND THEN
        -- Profile doesn't exist yet, create it with the correct role
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
            invitation_record.role,  -- Use exact role from invitation
            true,
            account_owner_id,
            NOW(),
            NOW()
        );
        profile_created := true;
    END IF;

    RAISE LOG 'accept_user_invitation: Profile updated for user % with role % and parent %', user_id_param, invitation_record.role, account_owner_id;

    -- Clear existing permissions first to ensure clean state
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

    -- Handle permissions seeding based on the INVITATION role
    perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
    IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (user_id_param, perm, inviter_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_inserted := permissions_inserted + 1;
        END LOOP;
        RAISE LOG 'accept_user_invitation: Seeded % permissions for role %', permissions_inserted, invitation_record.role;
    END IF;

    -- Mark invitation accepted
    UPDATE public.user_invitations
      SET status = 'accepted', updated_at = NOW()
      WHERE invitation_token = invitation_token_param::uuid;

    RAISE LOG 'accept_user_invitation: Successfully accepted invitation with role %', invitation_record.role;

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