-- Fix invitation acceptance and prevent privilege escalation
-- This addresses the critical issue where invited Staff/Admin users become Owners

-- 1. Improve handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_user_id UUID;
  invitation_role TEXT;
  account_owner_id UUID;
  seed_result INTEGER;
BEGIN
  -- Check if user was invited (metadata contains invitation_user_id)
  IF NEW.raw_user_meta_data ? 'invitation_user_id' THEN
    inviter_user_id := (NEW.raw_user_meta_data->>'invitation_user_id')::UUID;
    invitation_role := COALESCE(NEW.raw_user_meta_data->>'invitation_role', 'User');
    
    RAISE LOG 'handle_new_user: Processing invited user %. Inviter: %, Role: %', NEW.id, inviter_user_id, invitation_role;
    
    -- Get the account owner from the inviter
    SELECT public.get_account_owner(inviter_user_id) INTO account_owner_id;
    
    -- CRITICAL FIX: If get_account_owner returns NULL, use inviter as parent
    IF account_owner_id IS NULL THEN
      account_owner_id := inviter_user_id;
      RAISE LOG 'handle_new_user: get_account_owner returned NULL, using inviter % as parent', inviter_user_id;
    END IF;
    
    -- CRITICAL FIX: Validate role - never allow Owner role from invitation
    IF invitation_role = 'Owner' OR invitation_role = 'System Owner' THEN
      RAISE LOG 'handle_new_user: WARNING - Invitation attempted to create Owner role, defaulting to Admin';
      invitation_role := 'Admin';
    END IF;
    
    RAISE LOG 'handle_new_user: Creating invited user % with parent % and role %', NEW.id, account_owner_id, invitation_role;
    
    -- Insert user profile with the correct role from invitation
    INSERT INTO public.user_profiles (
      user_id, 
      display_name,
      parent_account_id,
      role,
      is_active
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      account_owner_id,
      invitation_role,
      true
    );
    
    -- Insert role into user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invitation_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE LOG 'handle_new_user: Successfully created invited user profile and role';
    
  ELSE
    -- Regular signup (not via invitation) - create as Owner
    RAISE LOG 'handle_new_user: Creating profile for regular signup user %', NEW.id;
    
    INSERT INTO public.user_profiles (
      user_id,
      display_name,
      role,
      parent_account_id,
      is_active
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      'Owner',
      NULL,
      true
    );
    
    -- Insert Owner role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Owner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Seed default window types for new account owners
    BEGIN
      SELECT seed_default_window_types(NEW.id) INTO seed_result;
      RAISE LOG 'handle_new_user: Seeded % window types for new owner %', seed_result, NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Failed to seed window types for %: %', NEW.id, SQLERRM;
    END;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Exception for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Improve accept_user_invitation to handle all cases
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
    existing_profile record;
BEGIN
    RAISE LOG 'accept_user_invitation: Starting for token % and user %', invitation_token_param, user_id_param;
    
    -- Fetch invitation
    SELECT * INTO invitation_record
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::uuid
      AND status = 'pending'
      AND expires_at > now();

    IF NOT FOUND THEN
        RAISE LOG 'accept_user_invitation: No pending invitation found';
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    -- Resolve account owner
    SELECT id INTO inviter_id FROM auth.users WHERE email = invitation_record.invited_by_email LIMIT 1;
    IF inviter_id IS NULL THEN
        inviter_id := invitation_record.user_id;
    END IF;
    
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id;
    END IF;

    RAISE LOG 'accept_user_invitation: Inviter %, Owner %, Role %', inviter_id, account_owner_id, invitation_record.role;

    -- Check if profile already exists
    SELECT * INTO existing_profile FROM public.user_profiles WHERE user_id = user_id_param;

    IF FOUND THEN
        -- Profile exists - update it if it's wrong
        RAISE LOG 'accept_user_invitation: Updating existing profile';
        
        -- CRITICAL FIX: If user is Owner but should be Staff/Admin, fix it
        IF existing_profile.role = 'Owner' AND invitation_record.role != 'Owner' THEN
            RAISE LOG 'accept_user_invitation: FIXING PRIVILEGE ESCALATION - User was Owner, should be %', invitation_record.role;
            
            -- Update profile
            UPDATE public.user_profiles SET
                role = invitation_record.role,
                parent_account_id = account_owner_id,
                is_active = true,
                updated_at = NOW()
            WHERE user_id = user_id_param;
            
            -- Fix user_roles table
            DELETE FROM public.user_roles WHERE user_id = user_id_param AND role = 'Owner';
            INSERT INTO public.user_roles (user_id, role)
            VALUES (user_id_param, invitation_record.role::app_role)
            ON CONFLICT (user_id, role) DO NOTHING;
            
        ELSIF existing_profile.parent_account_id IS NULL AND invitation_record.role != 'Owner' THEN
            -- Parent is NULL but shouldn't be
            RAISE LOG 'accept_user_invitation: Fixing NULL parent_account_id';
            UPDATE public.user_profiles SET
                parent_account_id = account_owner_id,
                updated_at = NOW()
            WHERE user_id = user_id_param;
        END IF;
    ELSE
        -- Profile doesn't exist - create it (shouldn't happen with trigger, but just in case)
        RAISE LOG 'accept_user_invitation: Creating new profile';
        INSERT INTO public.user_profiles (
            user_id,
            display_name,
            role,
            is_active,
            parent_account_id
        ) VALUES (
            user_id_param,
            COALESCE(invitation_record.invited_name, invitation_record.invited_email),
            invitation_record.role,
            true,
            account_owner_id
        );
        
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_id_param, invitation_record.role::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- Mark invitation as accepted
    UPDATE public.user_invitations SET
        status = 'accepted',
        updated_at = NOW()
    WHERE invitation_token = invitation_token_param::uuid;

    RAISE LOG 'accept_user_invitation: Success';
    RETURN jsonb_build_object('success', true);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'accept_user_invitation: ERROR - %', SQLERRM;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. Add validation to prevent future privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Prevent Staff/Admin/Manager users from having NULL parent_account_id
    IF NEW.role IN ('Staff', 'Admin', 'Manager', 'User') AND NEW.parent_account_id IS NULL THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Role % cannot have NULL parent_account_id. User: %', NEW.role, NEW.user_id;
    END IF;
    
    -- Prevent users from being their own parent
    IF NEW.parent_account_id = NEW.user_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Users cannot be their own parent. User: %', NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_privilege_escalation_prevention ON public.user_profiles;

-- Create trigger to prevent privilege escalation
CREATE TRIGGER enforce_privilege_escalation_prevention
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_privilege_escalation();