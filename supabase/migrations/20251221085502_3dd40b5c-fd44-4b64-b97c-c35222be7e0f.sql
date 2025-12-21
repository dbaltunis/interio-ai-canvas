-- Add missing permissions to existing users based on their roles
-- This fixes the issue where Copy Room and other features don't work for existing accounts

-- Add edit_all_jobs to Owner, Admin, Manager, System Owner
INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'edit_all_jobs'
FROM user_profiles up
WHERE up.role IN ('Owner', 'Admin', 'Manager', 'System Owner')
AND NOT EXISTS (
  SELECT 1 FROM user_permissions perm 
  WHERE perm.user_id = up.user_id 
  AND perm.permission_name = 'edit_all_jobs'
)
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Add edit_assigned_jobs to all roles
INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'edit_assigned_jobs'
FROM user_profiles up
WHERE up.role IN ('Owner', 'Admin', 'Manager', 'Staff', 'System Owner', 'User')
AND NOT EXISTS (
  SELECT 1 FROM user_permissions perm 
  WHERE perm.user_id = up.user_id 
  AND perm.permission_name = 'edit_assigned_jobs'
)
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Add delete_jobs to Owner, Admin, System Owner
INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'delete_jobs'
FROM user_profiles up
WHERE up.role IN ('Owner', 'Admin', 'System Owner')
AND NOT EXISTS (
  SELECT 1 FROM user_permissions perm 
  WHERE perm.user_id = up.user_id 
  AND perm.permission_name = 'delete_jobs'
)
ON CONFLICT (user_id, permission_name) DO NOTHING;