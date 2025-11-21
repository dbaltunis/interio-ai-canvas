-- Quick fix for the repair function
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
    SELECT role INTO existing_role FROM public.user_profiles WHERE user_id = user_id_param;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    SELECT public.get_account_owner(inviter_id_param) INTO account_owner_id;
    IF account_owner_id IS NULL THEN account_owner_id := inviter_id_param; END IF;
    
    UPDATE public.user_profiles SET role = should_be_role, parent_account_id = account_owner_id, updated_at = NOW()
    WHERE user_id = user_id_param;
    
    DELETE FROM public.user_roles WHERE user_id = user_id_param;
    INSERT INTO public.user_roles (user_id, role) VALUES (user_id_param, should_be_role::app_role);
    
    DELETE FROM public.user_permissions WHERE user_id = user_id_param;
    PERFORM public.fix_user_permissions_for_role(user_id_param);
    
    RETURN jsonb_build_object('success', true, 'from_role', existing_role, 'to_role', should_be_role);
END;
$$;

-- Apply fixes
SELECT repair_broken_invitation_account('f9bcea1b-38ac-4204-9aa4-caf16eac7d37'::uuid, 'Staff', 'ecff6451-e641-4baa-8f1d-d76709950025'::uuid);
SELECT repair_broken_invitation_account('866395ad-c79b-4a9e-9c44-56767e45a7ab'::uuid, 'Admin', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'::uuid);
SELECT repair_broken_invitation_account('e7f935f9-47d0-4334-8a9f-9d3c7fd9a204'::uuid, 'Admin', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'::uuid);
SELECT repair_broken_invitation_account('504dcfd2-16cd-4fdc-ace0-0dff56ae0bb4'::uuid, 'Staff', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'::uuid);