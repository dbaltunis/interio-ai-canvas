-- Fix ambiguous column reference by qualifying all column names with table names
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
  
  -- Delete records with account_owner_id foreign keys - use fully qualified column names
  DELETE FROM sms_delivery_logs WHERE sms_delivery_logs.account_owner_id = user_id_param;
  DELETE FROM sms_contacts WHERE sms_contacts.account_owner_id = user_id_param;
  DELETE FROM sms_campaigns WHERE sms_campaigns.account_owner_id = user_id_param;
  DELETE FROM sms_templates WHERE sms_templates.account_owner_id = user_id_param;
  DELETE FROM export_requests WHERE export_requests.account_owner_id = user_id_param;
  DELETE FROM integration_settings WHERE integration_settings.account_owner_id = user_id_param;
  DELETE FROM email_settings WHERE email_settings.account_owner_id = user_id_param;
  DELETE FROM account_settings WHERE account_settings.account_owner_id = user_id_param;
  
  -- Reassign all projects created by this user to the account owner
  UPDATE projects 
  SET created_by = account_owner_id,
      updated_at = NOW()
  WHERE projects.created_by = user_id_param;
  
  -- Reassign all projects where user_id matches to the account owner
  UPDATE projects
  SET user_id = account_owner_id,
      updated_at = NOW()
  WHERE projects.user_id = user_id_param;
  
  -- Reassign all quotes to the account owner
  UPDATE quotes
  SET user_id = account_owner_id,
      updated_at = NOW()
  WHERE quotes.user_id = user_id_param;
  
  -- Delete user's permissions
  DELETE FROM user_permissions WHERE user_permissions.user_id = user_id_param;
  
  -- Delete user's app flags
  DELETE FROM app_user_flags WHERE app_user_flags.user_id = user_id_param;
  
  -- Delete user's notification settings
  DELETE FROM user_notification_settings WHERE user_notification_settings.user_id = user_id_param;
  
  -- Finally, delete user profile
  DELETE FROM user_profiles WHERE user_profiles.user_id = user_id_param;
END;
$$;