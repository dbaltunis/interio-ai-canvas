-- Add KPI visibility permissions
INSERT INTO permissions (name, description, category) 
VALUES 
  ('view_primary_kpis', 'Can view primary metrics dashboard KPIs', 'dashboard'),
  ('view_email_kpis', 'Can view email performance KPIs', 'dashboard'),
  ('view_revenue_kpis', 'Can view revenue and financial KPIs', 'dashboard')
ON CONFLICT (name) DO NOTHING;

-- Drop existing function and recreate with updated permissions
DROP FUNCTION IF EXISTS get_default_permissions_for_role(TEXT);

CREATE FUNCTION get_default_permissions_for_role(user_role TEXT)
RETURNS TEXT[] AS $$
BEGIN
  CASE user_role
    WHEN 'Owner', 'System Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
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
        'view_primary_kpis', 'view_email_kpis', 'view_revenue_kpis'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs',
        'view_clients', 'create_clients', 'edit_clients',
        'view_inventory', 'manage_inventory',
        'view_vendors', 'manage_vendors',
        'view_quotes', 'manage_quotes',
        'view_calendar', 'manage_calendar',
        'view_team',
        'view_emails', 'send_emails',
        'view_analytics', 'view_profile',
        'view_own_jobs', 'view_all_jobs',
        'view_workroom',
        'view_primary_kpis', 'view_email_kpis', 'view_revenue_kpis'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'edit_jobs',
        'view_clients', 'create_clients', 'edit_clients',
        'view_inventory',
        'view_quotes', 'manage_quotes',
        'view_calendar',
        'view_emails', 'send_emails',
        'view_analytics', 'view_profile',
        'view_own_jobs', 'view_all_jobs',
        'view_primary_kpis', 'view_revenue_kpis'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_own_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_quotes', 'manage_quotes',
        'view_profile'
      ];
    WHEN 'User' THEN
      RETURN ARRAY['view_own_jobs', 'view_clients', 'view_profile'];
    ELSE
      RETURN ARRAY['view_profile'];
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant KPI permissions to existing Owners, Admins, and Managers
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id, role::text as user_role
    FROM user_roles
    WHERE role::text IN ('Owner', 'System Owner', 'Admin', 'Manager')
  LOOP
    -- Grant KPI permissions based on role
    IF user_record.user_role IN ('Owner', 'System Owner', 'Admin') THEN
      INSERT INTO user_permissions (user_id, permission_name)
      VALUES 
        (user_record.user_id, 'view_primary_kpis'),
        (user_record.user_id, 'view_email_kpis'),
        (user_record.user_id, 'view_revenue_kpis')
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    ELSIF user_record.user_role = 'Manager' THEN
      INSERT INTO user_permissions (user_id, permission_name)
      VALUES 
        (user_record.user_id, 'view_primary_kpis'),
        (user_record.user_id, 'view_revenue_kpis')
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END IF;
  END LOOP;
END $$;