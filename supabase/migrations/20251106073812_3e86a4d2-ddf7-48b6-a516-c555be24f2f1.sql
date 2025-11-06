-- Function to safely delete users and handle cascading relationships
CREATE OR REPLACE FUNCTION delete_user_cascade(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
  
  -- Reassign all quotes created by this user to the account owner
  UPDATE quotes
  SET created_by = account_owner_id,
      updated_at = NOW()
  WHERE created_by = user_id_param;
  
  -- Delete user's custom permissions
  DELETE FROM custom_permissions WHERE user_id = user_id_param;
  
  -- Delete user's app flags
  DELETE FROM app_user_flags WHERE user_id = user_id_param;
  
  -- Delete user's notification preferences
  DELETE FROM notification_preferences WHERE user_id = user_id_param;
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_id = user_id_param;
  
  -- Note: We don't delete the auth.users record as that requires admin privileges
  -- The user will be marked as deleted in auth.users automatically if RLS is set up correctly
END;
$$;