-- Fix the user_permissions table and accept_user_invitation function

-- 1. First check what columns exist in user_permissions table
-- Add missing columns if needed
DO $$
BEGIN
  -- Add granted_by column if it doesn't exist (better name than created_by)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_permissions' AND column_name = 'granted_by') THEN
    ALTER TABLE public.user_permissions ADD COLUMN granted_by UUID;
  END IF;
END $$;

-- 2. Fix the accept_user_invitation function to use the correct column name
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

    -- Handle permissions seeding with the granted_by column if it exists, otherwise without it
    IF invitation_record.permissions IS NOT NULL AND jsonb_typeof(invitation_record.permissions) = 'object' THEN
      -- Use explicit permissions from invitation (as object)
      FOR perm IN SELECT key FROM jsonb_each(invitation_record.permissions) WHERE value::boolean = true
      LOOP
        -- Check if granted_by column exists and use appropriate INSERT
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_permissions' AND column_name = 'granted_by') THEN
          INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
          VALUES (user_id_param, perm, inviter_id)
          ON CONFLICT DO NOTHING;
        ELSE
          INSERT INTO public.user_permissions (user_id, permission_name)
          VALUES (user_id_param, perm)
          ON CONFLICT DO NOTHING;
        END IF;
        permissions_inserted := permissions_inserted + 1;
      END LOOP;
      RAISE LOG 'accept_user_invitation: Seeded % object permissions for user %', permissions_inserted, user_id_param;
    ELSIF invitation_record.permissions IS NOT NULL AND jsonb_typeof(invitation_record.permissions) = 'array' THEN
      -- Use explicit permissions from invitation (as array)
      FOR perm IN SELECT jsonb_array_elements_text(invitation_record.permissions)
      LOOP
        -- Check if granted_by column exists and use appropriate INSERT
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_permissions' AND column_name = 'granted_by') THEN
          INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
          VALUES (user_id_param, perm, inviter_id)
          ON CONFLICT DO NOTHING;
        ELSE
          INSERT INTO public.user_permissions (user_id, permission_name)
          VALUES (user_id_param, perm)
          ON CONFLICT DO NOTHING;
        END IF;
        permissions_inserted := permissions_inserted + 1;
      END LOOP;
      RAISE LOG 'accept_user_invitation: Seeded % array permissions for user %', permissions_inserted, user_id_param;
    ELSE
      -- Seed defaults based on role when invitation had no explicit permissions
      perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
      IF perms_to_seed IS NOT NULL THEN
        FOREACH perm IN ARRAY perms_to_seed LOOP
          -- Check if granted_by column exists and use appropriate INSERT
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'user_permissions' AND column_name = 'granted_by') THEN
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (user_id_param, perm, inviter_id)
            ON CONFLICT DO NOTHING;
          ELSE
            INSERT INTO public.user_permissions (user_id, permission_name)
            VALUES (user_id_param, perm)
            ON CONFLICT DO NOTHING;
          END IF;
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