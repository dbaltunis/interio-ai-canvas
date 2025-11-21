-- Fix projects INSERT policy to respect create_jobs permission
DROP POLICY IF EXISTS "Account isolation - INSERT" ON projects;

CREATE POLICY "Permission-based project creation" ON projects
FOR INSERT 
WITH CHECK (
  -- Must be in same account
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  AND (
    -- Owners and Admins can always create
    is_admin() 
    OR get_user_role(auth.uid()) IN ('Owner', 'System Owner')
    -- OR users with create_jobs permission can create their own projects
    OR (has_permission('create_jobs') AND auth.uid() = user_id)
  )
);