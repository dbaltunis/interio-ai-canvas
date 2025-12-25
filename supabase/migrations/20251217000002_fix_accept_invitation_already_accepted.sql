-- Fix accept_user_invitation to handle invitations that were already accepted by the trigger
-- This makes the function idempotent and ensures profiles are correctly linked even if trigger already ran

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
    
    -- Fetch invitation - check both pending AND accepted (in case trigger already marked it)
    SELECT * INTO invitation_record
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::uuid
      AND (status = 'pending' OR status = 'accepted')
      AND expires_at > now();
    
    IF NOT FOUND THEN
        RAISE LOG 'accept_user_invitation: No valid invitation found for token %', invitation_token_param;
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;
    
    RAISE LOG 'accept_user_invitation: Found invitation for % (status: %), inviter user_id: %', 
        invitation_record.invited_email, invitation_record.status, invitation_record.user_id;
    
    -- Resolve account owner - use user_id from invitation (this is the inviter's ID)
    -- The invitation.user_id field stores the inviter's user_id
    inviter_id := invitation_record.user_id;
    
    -- Get the account owner from the inviter
    SELECT public.get_account_owner(inviter_id) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id;
        RAISE LOG 'accept_user_invitation: get_account_owner returned NULL, using inviter % as account owner', inviter_id;
    END IF;
    
    RAISE LOG 'accept_user_invitation: Inviter %, Account owner %, Role %', inviter_id, account_owner_id, invitation_record.role;
    
    -- Check if profile already exists
    SELECT * INTO existing_profile FROM public.user_profiles WHERE user_id = user_id_param;
    
    IF FOUND THEN
        -- Profile exists - ensure it's correctly linked
        RAISE LOG 'accept_user_invitation: Profile exists, ensuring correct linkage';
        
        -- CRITICAL: Always ensure parent_account_id is set correctly for invited users
        IF existing_profile.parent_account_id IS NULL OR existing_profile.parent_account_id != account_owner_id THEN
            RAISE LOG 'accept_user_invitation: Fixing parent_account_id from % to %', 
                existing_profile.parent_account_id, account_owner_id;
            UPDATE public.user_profiles SET
                parent_account_id = account_owner_id,
                role = COALESCE(NULLIF(invitation_record.role, 'Owner'), existing_profile.role),
                is_active = true,
                updated_at = NOW()
            WHERE user_id = user_id_param;
        END IF;
        
        -- Ensure role is correct (but never allow Owner role from invitation)
        IF invitation_record.role != 'Owner' AND invitation_record.role != 'System Owner' 
           AND existing_profile.role != invitation_record.role THEN
            RAISE LOG 'accept_user_invitation: Updating role from % to %', 
                existing_profile.role, invitation_record.role;
            UPDATE public.user_profiles SET
                role = invitation_record.role,
                updated_at = NOW()
            WHERE user_id = user_id_param;
            
            -- Update user_roles table
            DELETE FROM public.user_roles WHERE user_id = user_id_param;
            INSERT INTO public.user_roles (user_id, role)
            VALUES (user_id_param, invitation_record.role::app_role)
            ON CONFLICT (user_id, role) DO NOTHING;
        END IF;
    ELSE
        -- Profile doesn't exist - create it (shouldn't happen with trigger, but just in case)
        RAISE LOG 'accept_user_invitation: Creating new profile';
        INSERT INTO public.user_profiles (
            user_id,
            email,
            full_name,
            display_name,
            role,
            is_active,
            parent_account_id
        ) VALUES (
            user_id_param,
            invitation_record.invited_email,
            COALESCE(invitation_record.invited_name, invitation_record.invited_email),
            COALESCE(invitation_record.invited_name, invitation_record.invited_email),
            COALESCE(NULLIF(invitation_record.role, 'Owner'), 'Staff'),
            true,
            account_owner_id
        );
        
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_id_param, COALESCE(NULLIF(invitation_record.role, 'Owner'), 'Staff')::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    -- Mark invitation as accepted (idempotent - safe to call multiple times)
    UPDATE public.user_invitations SET
        status = 'accepted',
        updated_at = NOW()
    WHERE invitation_token = invitation_token_param::uuid;
    
    RAISE LOG 'accept_user_invitation: Success - User % linked to account owner %', user_id_param, account_owner_id;
    RETURN jsonb_build_object('success', true, 'account_owner_id', account_owner_id);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'accept_user_invitation: ERROR - %', SQLERRM;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

