-- Update user_profiles table to track real presence and last seen
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_logged_in BOOLEAN DEFAULT false;

-- Update existing users to set has_logged_in based on whether they have a last_seen time
UPDATE user_profiles 
SET has_logged_in = true 
WHERE updated_at IS NOT NULL;

-- Create function to update last seen when user is active
CREATE OR REPLACE FUNCTION update_user_last_seen(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to mark user as offline
CREATE OR REPLACE FUNCTION mark_user_offline(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    is_online = false,
    updated_at = now()
  WHERE user_profiles.user_id = mark_user_offline.user_id;
END;
$$;

-- Add RLS policies for the new functions
CREATE POLICY "Users can update their own last seen" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Create a view for easy querying of user presence
CREATE OR REPLACE VIEW user_presence_view AS
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