-- Fix delete_user_cascade to handle correct table names
CREATE OR REPLACE FUNCTION delete_user_cascade(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_owner_id UUID;
BEGIN
  -- Get the account owner for this user
  SELECT get_account_owner(user_id_param) INTO account_owner_id;
  
  -- Prevent deleting the account owner
  IF user_id_param = account_owner_id THEN
    RAISE EXCEPTION 'Cannot delete the account owner. Transfer ownership first.';
  END IF;
  
  -- Reassign all projects created by this user to the account owner
  UPDATE projects 
  SET created_by = account_owner_id,
      updated_at = NOW()
  WHERE created_by = user_id_param;
  
  -- Reassign all projects where user_id matches to the account owner
  UPDATE projects
  SET user_id = account_owner_id,
      updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Reassign all quotes to the account owner
  UPDATE quotes
  SET user_id = account_owner_id,
      updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Delete user's permissions
  DELETE FROM user_permissions WHERE user_id = user_id_param;
  
  -- Delete user's app flags (if exists)
  DELETE FROM app_user_flags WHERE user_id = user_id_param;
  
  -- Delete user's notification settings (correct table name)
  DELETE FROM user_notification_settings WHERE user_id = user_id_param;
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_id = user_id_param;
END;
$$;