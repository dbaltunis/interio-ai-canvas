-- Create a special repair function that can fix already-accepted invitations
CREATE OR REPLACE FUNCTION public.repair_broken_invitation_account(
    user_id_param uuid,
    should_be_role text,
    inviter_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    account_owner_id uuid;
    existing_role text;
BEGIN
    RAISE LOG 'repair_broken_invitation_account: Fixing user % to role %', user_id_param, should_be_role;
    
    -- Get current role
    SELECT role INTO existing_role FROM public.user_profiles WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Get account owner from inviter
    SELECT public.get_account_owner(inviter_id_param) INTO account_owner_id;
    IF account_owner_id IS NULL THEN
        account_owner_id := inviter_id_param;
    END IF;
    
    RAISE LOG 'repair_broken_invitation_account: Owner %, Current role: %, New role: %', 
              account_owner_id, existing_role, should_be_role;
    
    -- Update profile
    UPDATE public.user_profiles SET
        role = should_be_role,
        parent_account_id = account_owner_id,
        is_active = true,
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Fix user_roles table
    IF existing_role = 'Owner' AND should_be_role != 'Owner' THEN
        DELETE FROM public.user_roles WHERE user_id = user_id_param AND role = 'Owner';
    END IF;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id_param, should_be_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove permissions that don't match the new role
    DELETE FROM public.user_permissions 
    WHERE user_id = user_id_param;
    
    -- Seed correct permissions for the role
    PERFORM public.fix_user_permissions_for_role(user_id_param);
    
    RAISE LOG 'repair_broken_invitation_account: Successfully repaired user';
    
    RETURN jsonb_build_object(
        'success', true,
        'from_role', existing_role,
        'to_role', should_be_role,
        'parent_account_id', account_owner_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'repair_broken_invitation_account: ERROR - %', SQLERRM;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;