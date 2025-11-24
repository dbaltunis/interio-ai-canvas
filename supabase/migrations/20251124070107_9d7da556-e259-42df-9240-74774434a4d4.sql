-- Fix user_preferences duplicate rows issue
-- Step 1: Delete duplicate rows, keeping only the most recent for each user
DELETE FROM user_preferences
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_preferences
  ORDER BY user_id, updated_at DESC
);

-- Step 2: Add unique constraint on user_id to prevent future duplicates
ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);