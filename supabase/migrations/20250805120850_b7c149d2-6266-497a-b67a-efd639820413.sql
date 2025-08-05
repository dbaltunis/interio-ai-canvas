-- Fix account roles and set up permission system

-- Update baltunis@curtainscalculator.com to Owner with all permissions
UPDATE user_profiles 
SET role = 'Owner', permissions = '{}'::jsonb
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d';

-- Grant all permissions to the owner account
INSERT INTO user_permissions (user_id, permission_name) VALUES
('ec930f73-ef23-4430-921f-1b401859825d', 'view_jobs'),
('ec930f73-ef23-4430-921f-1b401859825d', 'create_jobs'),
('ec930f73-ef23-4430-921f-1b401859825d', 'delete_jobs'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_clients'),
('ec930f73-ef23-4430-921f-1b401859825d', 'create_clients'),
('ec930f73-ef23-4430-921f-1b401859825d', 'delete_clients'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_calendar'),
('ec930f73-ef23-4430-921f-1b401859825d', 'create_appointments'),
('ec930f73-ef23-4430-921f-1b401859825d', 'delete_appointments'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_inventory'),
('ec930f73-ef23-4430-921f-1b401859825d', 'manage_inventory'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_window_treatments'),
('ec930f73-ef23-4430-921f-1b401859825d', 'manage_window_treatments'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_analytics'),
('ec930f73-ef23-4430-921f-1b401859825d', 'view_settings'),
('ec930f73-ef23-4430-921f-1b401859825d', 'manage_settings'),
('ec930f73-ef23-4430-921f-1b401859825d', 'manage_users')
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Update darius+baltunis@curtainscalculator.com to Staff and remove excess permissions
UPDATE user_profiles 
SET role = 'Staff', permissions = '{}'::jsonb
WHERE user_id = '5b090e31-e15e-4e10-8fca-79456bf4c165';

-- Remove all current permissions for the staff account
DELETE FROM user_permissions 
WHERE user_id = '5b090e31-e15e-4e10-8fca-79456bf4c165';

-- Grant basic staff permissions to darius+baltunis@curtainscalculator.com
INSERT INTO user_permissions (user_id, permission_name) VALUES
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'view_jobs'),
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'create_jobs'),
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'view_clients'),
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'create_clients'),
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'view_calendar'),
('5b090e31-e15e-4e10-8fca-79456bf4c165', 'view_inventory')
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Create role-based permission templates function
CREATE OR REPLACE FUNCTION get_default_permissions_for_role(user_role text)
RETURNS text[] AS $$
BEGIN
  CASE user_role
    WHEN 'Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'delete_clients', 
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings', 'manage_settings', 'manage_users'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'delete_clients',
        'view_calendar', 'create_appointments', 'delete_appointments', 
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_calendar', 'create_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients', 
        'view_calendar',
        'view_inventory'
      ];
    ELSE
      RETURN ARRAY[]::text[];
  END CASE;
END;
$$ LANGUAGE plpgsql;