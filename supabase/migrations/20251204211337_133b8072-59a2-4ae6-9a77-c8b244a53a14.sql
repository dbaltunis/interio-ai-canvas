-- Fix Rachel's missing permissions (add view_window_treatments and manage_window_treatments)
INSERT INTO user_permissions (user_id, permission_name)
SELECT '708d8e36-8fa3-4e07-b43b-c0a90941f991', unnest(ARRAY['view_window_treatments', 'manage_window_treatments'])
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Fix quote_templates RLS policy to prevent cross-account data leaks
-- Drop the policy that uses is_admin() which causes data leaks
DROP POLICY IF EXISTS "Users can view their own templates or admin can view all" ON quote_templates;

-- Create proper account-based RLS policy
CREATE POLICY "Users can view their own account templates"
ON quote_templates
FOR SELECT
USING (
  user_id = auth.uid() 
  OR user_id IN (
    SELECT user_id FROM user_profiles 
    WHERE parent_account_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
    OR user_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
  )
);

-- Also fix any other policies using is_admin() on quote_templates
DROP POLICY IF EXISTS "Users can insert their own templates" ON quote_templates;
CREATE POLICY "Users can insert their own templates"
ON quote_templates
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own templates or admin can update all" ON quote_templates;
CREATE POLICY "Users can update their own account templates"
ON quote_templates
FOR UPDATE
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT user_id FROM user_profiles 
    WHERE parent_account_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
    OR user_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete their own templates" ON quote_templates;
CREATE POLICY "Users can delete their own account templates"
ON quote_templates
FOR DELETE
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT user_id FROM user_profiles 
    WHERE parent_account_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
    OR user_id = (SELECT parent_account_id FROM user_profiles WHERE user_id = auth.uid())
  )
);