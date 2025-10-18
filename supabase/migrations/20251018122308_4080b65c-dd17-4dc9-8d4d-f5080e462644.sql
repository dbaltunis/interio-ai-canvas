-- Add permission seeding log table for tracking all seeding attempts
CREATE TABLE IF NOT EXISTS public.permission_seed_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions_added TEXT[],
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  triggered_by TEXT, -- 'invitation_acceptance', 'repair_job', 'manual_retry'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.permission_seed_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view permission seed logs
CREATE POLICY "Admins can view permission seed logs"
  ON public.permission_seed_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create index for faster queries
CREATE INDEX idx_permission_seed_log_user_id ON public.permission_seed_log(user_id);
CREATE INDEX idx_permission_seed_log_success ON public.permission_seed_log(success);
CREATE INDEX idx_permission_seed_log_created_at ON public.permission_seed_log(created_at DESC);

-- Update accept_user_invitation function to add detailed logging and retry logic
CREATE OR REPLACE FUNCTION public.accept_user_invitation(
  invitation_token_param text,
  user_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    seed_error text := NULL;
BEGIN
    RAISE LOG 'accept_user_invitation: Starting acceptance for token % and user %', invitation_token_param, user_id_param;
    
    -- Fetch invitation (pending & not expired)
    SELECT * INTO invitation_record
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::uuid
      AND status = 'pending'
      AND expires_at > now();

    IF NOT FOUND THEN
        -- Check if already accepted (idempotency)
        SELECT * INTO invitation_record
        FROM public.user_invitations 
        WHERE invitation_token = invitation_token_param::uuid
          AND status = 'accepted';
        
        IF FOUND THEN
            RAISE LOG 'accept_user_invitation: Invitation already accepted, ensuring permissions...';
            -- Re-seed permissions to be safe
            BEGIN
                perms_to_seed := public.get_default_permissions_for_role(invitation_record.role);
                IF perms_to_seed IS NOT NULL THEN
                    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
                    FOREACH perm IN ARRAY perms_to_seed LOOP
                        INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                        VALUES (user_id_param, perm, invitation_record.user_id)
                        ON CONFLICT (user_id, permission_name) DO NOTHING;
                        permissions_inserted := permissions_inserted + 1;
                    END LOOP;
                END IF;
                
                -- Log successful re-seeding
                INSERT INTO public.permission_seed_log (
                    user_id, role, permissions_added, success, triggered_by
                ) VALUES (
                    user_id_param, invitation_record.role, perms_to_seed, true, 'invitation_acceptance_idempotent'
                );
            EXCEPTION WHEN OTHERS THEN
                seed_error := SQLERRM;
                RAISE LOG 'accept_user_invitation: Re-seeding failed: %', seed_error;
            END;
            
            RETURN jsonb_build_object(
                'success', true,
                'already_accepted', true,
                'role', invitation_record.role,
                'permissions_inserted_count', permissions_inserted
            );
        END IF;
        
        RAISE LOG 'accept_user_invitation: No valid invitation found for token %', invitation_token_param;
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    RAISE LOG 'accept_user_invitation: Found invitation for % by %', invitation_record.invited_email, invitation_record.invited_by_email;

    -- Resolve inviter id (by email) and their account owner
    SELECT id INTO inviter_id FROM auth.users WHERE email = invitation_record.invited_by_email LIMIT 1;
    IF inviter_id IS NULL THEN
        inviter_id := invitation_record.user_id;
    END IF;
    
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id;
    END IF;

    RAISE LOG 'accept_user_invitation: Inviter %, Account owner %', inviter_id, account_owner_id;

    -- Create or update user profile
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

    -- Seed permissions with error handling
    BEGIN
        DELETE FROM public.user_permissions WHERE user_id = user_id_param;
        RAISE LOG 'accept_user_invitation: Cleared existing permissions for user %', user_id_param;

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

        -- Log successful seeding
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, triggered_by
        ) VALUES (
            user_id_param, invitation_record.role, perms_to_seed, true, 'invitation_acceptance'
        );

    EXCEPTION WHEN OTHERS THEN
        seed_error := SQLERRM;
        RAISE LOG 'accept_user_invitation: Permission seeding failed: %', seed_error;
        
        -- Log failed seeding
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, error_message, triggered_by
        ) VALUES (
            user_id_param, invitation_record.role, perms_to_seed, false, seed_error, 'invitation_acceptance'
        );
    END;

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
      'profile_created', profile_created,
      'seed_error', seed_error
    );
END;
$$;

-- Update fix_user_permissions_for_role to add logging
CREATE OR REPLACE FUNCTION public.fix_user_permissions_for_role(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    expected_perms text[];
    existing_perms text[];
    missing_perms text[];
    perm_to_add text;
    permissions_added int := 0;
    inviter_id uuid;
    seed_error text := NULL;
BEGIN
    -- Get user's role and parent account
    SELECT up.role, up.parent_account_id INTO user_role, inviter_id
    FROM public.user_profiles up
    WHERE up.user_id = target_user_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Get expected permissions for role
    expected_perms := public.get_default_permissions_for_role(user_role);
    
    -- Get existing permissions
    SELECT array_agg(uper.permission_name) INTO existing_perms
    FROM public.user_permissions uper
    WHERE uper.user_id = target_user_id;
    
    existing_perms := COALESCE(existing_perms, ARRAY[]::text[]);
    
    -- Find missing permissions
    SELECT array_agg(expected_perm) INTO missing_perms
    FROM unnest(expected_perms) AS expected_perm
    WHERE expected_perm != ALL(existing_perms);
    
    missing_perms := COALESCE(missing_perms, ARRAY[]::text[]);
    
    -- Add missing permissions with error handling
    BEGIN
        FOREACH perm_to_add IN ARRAY missing_perms LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (target_user_id, perm_to_add, inviter_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
            permissions_added := permissions_added + 1;
        END LOOP;
        
        -- Log successful repair
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, triggered_by
        ) VALUES (
            target_user_id, user_role, missing_perms, true, 'manual_repair'
        );
        
    EXCEPTION WHEN OTHERS THEN
        seed_error := SQLERRM;
        
        -- Log failed repair
        INSERT INTO public.permission_seed_log (
            user_id, role, permissions_added, success, error_message, triggered_by
        ) VALUES (
            target_user_id, user_role, missing_perms, false, seed_error, 'manual_repair'
        );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_role', user_role,
        'expected_permissions', expected_perms,
        'existing_permissions', existing_perms,
        'missing_permissions', missing_perms,
        'permissions_added', permissions_added,
        'seed_error', seed_error
    );
END;
$$;

-- Add unique constraint to prevent duplicate invitation acceptance
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_acceptance_per_token 
ON public.user_invitations(invitation_token) 
WHERE status = 'accepted';

COMMENT ON TABLE public.permission_seed_log IS 'Tracks all permission seeding attempts for debugging and monitoring';
COMMENT ON INDEX idx_one_acceptance_per_token IS 'Ensures invitations can only be accepted once (idempotency)';
