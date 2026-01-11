-- Add permissions for users with Dealer role
-- This ensures dealers can create jobs, view their own jobs/clients, and browse inventory
INSERT INTO user_permissions (user_id, permission_name)
SELECT ur.user_id, perm.name
FROM user_roles ur
CROSS JOIN (
  VALUES 
    ('create_jobs'),
    ('view_assigned_jobs'),
    ('view_assigned_clients'),
    ('view_inventory'),
    ('view_profile')
) AS perm(name)
WHERE ur.role = 'Dealer'
ON CONFLICT (user_id, permission_name) DO NOTHING;