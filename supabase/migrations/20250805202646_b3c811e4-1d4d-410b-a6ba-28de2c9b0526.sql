-- Add profile access permission that all users should have
INSERT INTO permissions (name, description, category) VALUES 
('view_profile', 'Can view and edit own profile', 'profile')
ON CONFLICT (name) DO NOTHING;

-- Grant profile access to all existing users
INSERT INTO user_permissions (user_id, permission_name)
SELECT user_id, 'view_profile'
FROM user_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up2 
  WHERE up2.user_id = user_profiles.user_id 
  AND up2.permission_name = 'view_profile'
);