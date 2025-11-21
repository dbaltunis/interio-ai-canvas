-- Fix Staff permissions - grant view_own_jobs to all Staff users
-- and update the default permissions function

-- 1. Grant view_own_jobs to all existing Staff users
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT up.user_id, 'view_own_jobs', up.parent_account_id
FROM user_profiles up
WHERE up.role = 'Staff'
  AND NOT EXISTS (
    SELECT 1 FROM user_permissions uper 
    WHERE uper.user_id = up.user_id 
    AND uper.permission_name = 'view_own_jobs'
  );

-- 2. Update the default permissions function to include view_own_jobs for Staff
CREATE OR REPLACE FUNCTION get_default_permissions_for_role(user_role TEXT)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE user_role
    WHEN 'Owner' THEN ARRAY[
      'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_own_jobs',
      'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
      'view_projects', 'create_projects', 'delete_projects', 'view_all_projects',
      'view_calendar', 'create_appointments', 'delete_appointments',
      'view_inventory', 'manage_inventory',
      'view_window_treatments', 'manage_window_treatments',
      'manage_quotes',
      'view_emails',
      'view_analytics',
      'view_settings', 'manage_settings', 'manage_users',
      'view_shopify', 'manage_shopify',
      'view_workroom', 'view_materials',
      'view_profile'
    ]
    WHEN 'System Owner' THEN ARRAY[
      'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_own_jobs',
      'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
      'view_projects', 'create_projects', 'delete_projects', 'view_all_projects',
      'view_calendar', 'create_appointments', 'delete_appointments',
      'view_inventory', 'manage_inventory',
      'view_window_treatments', 'manage_window_treatments',
      'manage_quotes',
      'view_emails',
      'view_analytics',
      'view_settings', 'manage_settings', 'manage_users',
      'view_shopify', 'manage_shopify',
      'view_workroom', 'view_materials',
      'view_profile'
    ]
    WHEN 'Admin' THEN ARRAY[
      'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_own_jobs',
      'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
      'view_projects', 'create_projects', 'delete_projects', 'view_all_projects',
      'view_calendar', 'create_appointments', 'delete_appointments',
      'view_inventory', 'manage_inventory',
      'view_window_treatments', 'manage_window_treatments',
      'manage_quotes',
      'view_emails',
      'view_analytics',
      'view_settings', 'manage_settings', 'manage_users',
      'view_workroom', 'view_materials',
      'view_profile'
    ]
    WHEN 'Manager' THEN ARRAY[
      'view_jobs', 'create_jobs', 'view_all_jobs', 'view_own_jobs',
      'view_clients', 'create_clients', 'view_all_clients',
      'view_projects', 'create_projects', 'view_all_projects',
      'view_calendar', 'create_appointments',
      'view_inventory',
      'view_window_treatments', 'manage_window_treatments',
      'manage_quotes',
      'view_analytics',
      'view_workroom', 'view_materials',
      'view_profile'
    ]
    WHEN 'Staff' THEN ARRAY[
      'view_own_jobs',  -- NEW: Staff can view their own jobs by default
      'view_jobs',      -- Legacy support
      'create_jobs',
      'view_clients',
      'create_clients',
      'view_calendar',
      'view_inventory',
      'manage_quotes',
      'view_profile'
    ]
    WHEN 'User' THEN ARRAY[
      'view_own_jobs',  -- NEW: Users can view their own jobs by default
      'view_jobs',      -- Legacy support
      'view_clients',
      'view_profile'
    ]
    ELSE ARRAY[]::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Also update the RLS policy to accept legacy view_jobs permission for backward compatibility
DROP POLICY IF EXISTS "Permission-based project access" ON projects;

CREATE POLICY "Permission-based project access" ON projects
FOR SELECT USING (
  -- Owners and Admins see everything in their account
  (is_admin() OR get_user_role(auth.uid()) IN ('Owner', 'System Owner'))
  OR
  -- Users with view_all_jobs permission see all account projects
  (
    has_permission('view_all_jobs') 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  OR
  -- Users with view_own_jobs see only their own (NEW)
  (has_permission('view_own_jobs') AND auth.uid() = user_id)
  OR
  -- Legacy: Users with view_jobs who own the project (for backward compatibility)
  (has_permission('view_jobs') AND auth.uid() = user_id)
  OR
  -- Legacy support: if they have view_all_projects, also see all projects
  (
    has_permission('view_all_projects')
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
);