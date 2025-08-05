-- Update Staff role permissions to include view_all permissions for team collaboration
INSERT INTO user_permissions (user_id, permission_name)
SELECT user_id, 'view_all_jobs'
FROM user_profiles 
WHERE role = 'Staff' 
AND user_id NOT IN (
  SELECT user_id FROM user_permissions WHERE permission_name = 'view_all_jobs'
);

INSERT INTO user_permissions (user_id, permission_name)
SELECT user_id, 'view_all_clients'
FROM user_profiles 
WHERE role = 'Staff' 
AND user_id NOT IN (
  SELECT user_id FROM user_permissions WHERE permission_name = 'view_all_clients'
);

INSERT INTO user_permissions (user_id, permission_name)
SELECT user_id, 'view_all_projects'
FROM user_profiles 
WHERE role = 'Staff' 
AND user_id NOT IN (
  SELECT user_id FROM user_permissions WHERE permission_name = 'view_all_projects'
);