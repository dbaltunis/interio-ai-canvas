-- Fix the accept_user_invitation function to properly handle UUID comparison
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token_param TEXT, user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    invitation_record RECORD;
    result JSONB;
BEGIN
    -- Get the invitation details with proper UUID casting
    SELECT * INTO invitation_record 
    FROM public.user_invitations 
    WHERE invitation_token = invitation_token_param::UUID 
    AND status = 'pending'
    AND expires_at > NOW();
    
    -- Check if invitation exists and is valid
    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Invalid or expired invitation"}'::JSONB;
    END IF;
    
    -- Update user profile with invitation details
    INSERT INTO public.user_profiles (
        user_id, 
        display_name, 
        role, 
        permissions,
        is_active
    ) VALUES (
        user_id_param,
        COALESCE(invitation_record.invited_name, invitation_record.invited_email),
        invitation_record.role,
        COALESCE(invitation_record.permissions, '{}'::JSONB),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = invitation_record.role,
        permissions = COALESCE(invitation_record.permissions, '{}'::JSONB),
        is_active = true,
        display_name = COALESCE(user_profiles.display_name, invitation_record.invited_name, invitation_record.invited_email);
    
    -- Mark invitation as accepted with proper UUID casting
    UPDATE public.user_invitations 
    SET status = 'accepted', updated_at = NOW()
    WHERE invitation_token = invitation_token_param::UUID;
    
    RETURN jsonb_build_object(
        'success', true, 
        'role', invitation_record.role,
        'permissions', invitation_record.permissions
    );
END;
$$;