-- Add edit_assigned_jobs permission for Dealer role users
-- This allows dealers to edit their own jobs (rooms, surfaces, quotes)
INSERT INTO user_permissions (user_id, permission_name)
SELECT up.user_id, 'edit_assigned_jobs'
FROM user_profiles up
WHERE up.role = 'Dealer'
ON CONFLICT (user_id, permission_name) DO NOTHING;