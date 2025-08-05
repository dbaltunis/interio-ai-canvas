-- Remove export and management permissions from Staff users
DELETE FROM user_permissions 
WHERE user_id IN (
  SELECT user_id FROM user_profiles WHERE role = 'Staff'
) 
AND permission_name IN (
  'manage_inventory', 'manage_window_treatments', 'manage_settings', 
  'manage_users', 'manage_calendar', 'manage_quotes', 'export_clients', 
  'export_data', 'delete_jobs', 'delete_clients', 'delete_appointments'
);