-- Drop and recreate the function with a different parameter name
DROP FUNCTION IF EXISTS delete_user_cascade(uuid);

-- Recreate with new parameter name to avoid conflicts
CREATE OR REPLACE FUNCTION delete_user_cascade(user_id_param uuid)
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
  IF user_id_param = get_account_owner(user_id_param) THEN
    RAISE EXCEPTION 'Cannot delete account owner';
  END IF;

  -- Delete related records first
  DELETE FROM user_permissions WHERE user_id = user_id_param;
  DELETE FROM permission_audit_log WHERE target_user_id = user_id_param OR user_id = user_id_param;
  DELETE FROM user_invitations WHERE user_id = user_id_param;
  
  -- Mark any invitations sent to this user's email as expired
  UPDATE user_invitations 
  SET status = 'expired', updated_at = now()
  WHERE invited_email = (SELECT email FROM auth.users WHERE id = user_id_param)
    AND status = 'pending';
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_id = user_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_cascade(uuid) TO authenticated;