-- Fix the user_presence_view to properly handle users who never logged in
DROP VIEW IF EXISTS user_presence_view;

CREATE VIEW user_presence_view AS
SELECT 
  up.user_id,
  up.last_seen,
  up.has_logged_in,
  up.is_online,
  up.updated_at,
  up.display_name,
  up.avatar_url,
  up.role,
  up.status_message,
  CASE 
    WHEN up.has_logged_in = false THEN 'never_logged_in'
    WHEN up.is_online = true THEN 'online'
    WHEN up.last_seen IS NULL THEN 'never_logged_in'
    WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
    ELSE 'away'
  END as status
FROM user_profiles up
WHERE up.is_active = true;