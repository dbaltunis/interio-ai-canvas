-- Fix security issues by updating functions to use proper search_path and fixing view

-- Fix function search paths
CREATE OR REPLACE FUNCTION update_user_last_seen(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    last_seen = now(),
    is_online = true,
    has_logged_in = true,
    updated_at = now()
  WHERE user_profiles.user_id = update_user_last_seen.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_user_offline(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    is_online = false,
    updated_at = now()
  WHERE user_profiles.user_id = mark_user_offline.user_id;
END;
$$;

-- Remove the security definer view and make it a regular view
DROP VIEW IF EXISTS user_presence_view;
CREATE VIEW user_presence_view AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  role,
  CASE 
    WHEN is_online = true AND last_seen > (now() - interval '5 minutes') THEN 'online'
    WHEN has_logged_in = false THEN 'never_logged_in'
    WHEN last_seen > (now() - interval '1 hour') THEN 'away'
    ELSE 'offline'
  END as status,
  last_seen,
  has_logged_in,
  is_online,
  status_message,
  updated_at
FROM user_profiles
WHERE is_active = true;