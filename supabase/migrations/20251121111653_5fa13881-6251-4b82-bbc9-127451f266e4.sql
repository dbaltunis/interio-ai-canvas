-- CRITICAL SECURITY FIX: Add account isolation to Owner role in projects RLS
-- Bug: Owners could see ALL projects across ALL accounts
-- Fix: Owners can only see projects within their account

DROP POLICY IF EXISTS "Permission-based project access" ON projects;

CREATE POLICY "Permission-based project access" ON projects
FOR SELECT USING (
  -- System Owners see everything (multi-account access)
  (get_user_role(auth.uid()) = 'System Owner')
  OR
  -- Account Owners see everything IN THEIR ACCOUNT ONLY (fixed)
  (
    get_user_role(auth.uid()) = 'Owner' 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  OR
  -- Admins see everything IN THEIR ACCOUNT ONLY (fixed)
  (
    is_admin() 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  OR
  -- Users with view_all_jobs permission see all account projects
  (
    has_permission('view_all_jobs') 
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  OR
  -- Users with view_own_jobs see only their own
  (has_permission('view_own_jobs') AND auth.uid() = user_id)
  OR
  -- Legacy: Users with view_jobs who own the project
  (has_permission('view_jobs') AND auth.uid() = user_id)
  OR
  -- Legacy support: if they have view_all_projects, also see all projects
  (
    has_permission('view_all_projects')
    AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
);

COMMENT ON POLICY "Permission-based project access" ON projects IS 
'FIXED: Added account isolation for Owner and Admin roles. Only System Owners have cross-account access.';