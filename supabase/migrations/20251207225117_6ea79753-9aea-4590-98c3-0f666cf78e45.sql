-- Update get_default_permissions_for_role to include missing permissions for Owner role
CREATE OR REPLACE FUNCTION public.get_default_permissions_for_role(user_role text)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE user_role
    WHEN 'Owner', 'System Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
        'view_all_clients', 'edit_all_clients',
        'view_inventory', 'manage_inventory',
        'view_vendors', 'manage_vendors',
        'view_quotes', 'manage_quotes',
        'view_calendar', 'manage_calendar',
        'view_team', 'manage_team',
        'view_emails', 'send_emails',
        'view_settings', 'manage_settings',
        'view_analytics', 'view_profile',
        'view_own_jobs', 'view_all_jobs',
        'view_workroom', 'view_materials',
        'view_primary_kpis', 'view_email_kpis', 'view_revenue_kpis',
        'view_window_treatments', 'manage_window_treatments',
        'manage_users'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs',
        'view_clients', 'create_clients', 'edit_clients',
        'view_all_clients', 'edit_all_clients',
        'view_inventory', 'manage_inventory',
        'view_vendors', 'manage_vendors',
        'view_quotes', 'manage_quotes',
        'view_calendar', 'manage_calendar',
        'view_team',
        'view_emails', 'send_emails',
        'view_settings',
        'view_analytics', 'view_profile',
        'view_own_jobs', 'view_all_jobs',
        'view_workroom', 'view_materials',
        'view_primary_kpis', 'view_email_kpis',
        'view_window_treatments', 'manage_window_treatments'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs',
        'view_clients', 'create_clients', 'edit_clients',
        'view_all_clients',
        'view_inventory',
        'view_vendors',
        'view_quotes', 'manage_quotes',
        'view_calendar', 'manage_calendar',
        'view_emails', 'send_emails',
        'view_profile',
        'view_own_jobs', 'view_all_jobs',
        'view_workroom', 'view_materials',
        'view_window_treatments'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_inventory',
        'view_quotes',
        'view_calendar',
        'view_profile',
        'view_own_jobs',
        'view_workroom',
        'view_window_treatments'
      ];
    WHEN 'User' THEN
      RETURN ARRAY['view_profile'];
    ELSE
      RETURN ARRAY['view_profile'];
  END CASE;
END;
$$;

-- Add missing permissions to all existing Owner accounts
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  up.user_id,
  perm.permission_name,
  up.user_id as granted_by
FROM user_profiles up
CROSS JOIN (
  VALUES 
    ('view_window_treatments'),
    ('manage_window_treatments'),
    ('manage_users')
) AS perm(permission_name)
WHERE up.role = 'Owner'
  AND NOT EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = up.user_id 
    AND permission_name = perm.permission_name
  );

-- Also add to Admin users (they need view/manage window treatments)
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  up.user_id,
  perm.permission_name,
  COALESCE(up.parent_account_id, up.user_id) as granted_by
FROM user_profiles up
CROSS JOIN (
  VALUES 
    ('view_window_treatments'),
    ('manage_window_treatments')
) AS perm(permission_name)
WHERE up.role = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = up.user_id 
    AND permission_name = perm.permission_name
  );