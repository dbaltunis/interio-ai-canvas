-- Reset presence data for users who were invited but never actually logged in
-- First, check which users have profiles but no auth records or no login activity
UPDATE user_profiles 
SET 
  has_logged_in = false,
  is_online = false,
  last_seen = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = user_profiles.user_id 
  AND auth.users.last_sign_in_at IS NOT NULL
);

-- Also update any user with email-like display names who likely never logged in
UPDATE user_profiles 
SET 
  has_logged_in = false,
  is_online = false,
  last_seen = NULL
WHERE display_name ~ '^[^@]+@[^@]+\.[^@]+$'  -- Email pattern
AND role = 'Staff';  -- Invited users usually have Staff role initially