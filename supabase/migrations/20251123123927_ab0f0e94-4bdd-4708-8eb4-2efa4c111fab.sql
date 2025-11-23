-- Fix emails table RLS policies for proper visibility
-- Drop existing overly complex policies
DROP POLICY IF EXISTS "Users can view account emails" ON emails;
DROP POLICY IF EXISTS "Users can view their own emails" ON emails;
DROP POLICY IF EXISTS "read emails" ON emails;
DROP POLICY IF EXISTS "read own emails" ON emails;
DROP POLICY IF EXISTS "Users can create their own emails" ON emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON emails;

-- Create simple, working policies
-- Allow users to view emails they created OR emails created by their account owner
CREATE POLICY "Users can view own and account emails" ON emails
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    user_id IN (
      SELECT user_id FROM user_profiles WHERE parent_account_id = (
        SELECT COALESCE(parent_account_id, user_id) FROM user_profiles WHERE user_id = auth.uid()
      )
    )
    OR
    user_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Allow users to create emails
CREATE POLICY "Users can create emails" ON emails
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own emails
CREATE POLICY "Users can update own emails" ON emails
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own emails
CREATE POLICY "Users can delete own emails" ON emails
  FOR DELETE
  USING (auth.uid() = user_id);