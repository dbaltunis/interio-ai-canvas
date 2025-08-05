-- Add missing permissions for export and delete functionality
INSERT INTO permissions (name, description, category) VALUES 
('export_data', 'Can export data (users, clients, etc.)', 'admin'),
('delete_users', 'Can delete user accounts', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Grant these permissions to users with Owner role
INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'export_data'
FROM user_profiles up 
WHERE up.role = 'Owner'
AND NOT EXISTS (
  SELECT 1 FROM user_permissions up2 
  WHERE up2.user_id = up.user_id 
  AND up2.permission_name = 'export_data'
);

INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'delete_users'
FROM user_profiles up 
WHERE up.role = 'Owner'
AND NOT EXISTS (
  SELECT 1 FROM user_permissions up2 
  WHERE up2.user_id = up.user_id 
  AND up2.permission_name = 'delete_users'
);