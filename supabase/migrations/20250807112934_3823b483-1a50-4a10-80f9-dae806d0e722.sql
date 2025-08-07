-- Ensure users who never logged in have correct initial values
UPDATE user_profiles 
SET 
  has_logged_in = false,
  is_online = false,
  last_seen = NULL
WHERE has_logged_in IS NULL OR last_seen IS NULL;