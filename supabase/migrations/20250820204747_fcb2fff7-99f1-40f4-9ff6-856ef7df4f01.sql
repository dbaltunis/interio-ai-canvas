-- Fix the ambiguous column reference in delete_user_cascade function
CREATE OR REPLACE FUNCTION delete_user_cascade(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user has permission to delete users
  IF NOT has_permission('manage_users') THEN
    RAISE EXCEPTION 'Insufficient permissions to delete users';
  END IF;

  -- Prevent deleting account owner
  IF target_user_id = get_account_owner(target_user_id) THEN
    RAISE EXCEPTION 'Cannot delete account owner';
  END IF;

  -- Delete related records first (fix ambiguous column reference)
  DELETE FROM user_permissions WHERE user_permissions.user_id = target_user_id;
  DELETE FROM permission_audit_log WHERE permission_audit_log.target_user_id = target_user_id OR permission_audit_log.user_id = target_user_id;
  DELETE FROM user_invitations WHERE user_invitations.user_id = target_user_id;
  
  -- Mark any invitations sent to this user's email as expired
  UPDATE user_invitations 
  SET status = 'expired', updated_at = now()
  WHERE invited_email = (SELECT email FROM auth.users WHERE id = target_user_id)
    AND status = 'pending';
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_profiles.user_id = target_user_id;
  
  -- Note: We don't delete from auth.users as that's managed by Supabase
END;
$$;