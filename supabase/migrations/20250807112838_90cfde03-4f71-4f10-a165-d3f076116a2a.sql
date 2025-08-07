-- Fix the security issue by recreating the view without SECURITY DEFINER
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
    WHEN up.has_logged_in = false OR up.has_logged_in IS NULL THEN 'never_logged_in'
    WHEN up.is_online = true THEN 'online'
    WHEN up.last_seen IS NULL THEN 'never_logged_in'
    WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
    ELSE 'away'
  END as status
FROM user_profiles up
WHERE up.is_active = true OR up.is_active IS NULL;

-- Enable RLS on the view
ALTER VIEW user_presence_view SET (security_barrier = false);