-- Fix project RLS policy to ensure System Owners also respect account isolation
-- This prevents users from seeing projects across different accounts

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Permission-based project access" ON public.projects;

-- Recreate with proper account isolation for ALL user types including System Owner
CREATE POLICY "Permission-based project access" 
ON public.projects
FOR SELECT
USING (
  -- All users (including System Owners) must be in the same account hierarchy
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  AND (
    -- System Owners can view all projects within their account
    get_user_role(auth.uid()) = 'System Owner'
    -- Account Owners can view all projects in their account
    OR get_user_role(auth.uid()) = 'Owner'
    -- Admins can view all projects in their account
    OR is_admin()
    -- Users with view_all_jobs permission can view all jobs in their account
    OR has_permission('view_all_jobs')
    -- Users with view_all_projects permission can view all projects in their account
    OR has_permission('view_all_projects')
    -- Users with view_own_jobs can only view their own jobs
    OR (has_permission('view_own_jobs') AND auth.uid() = user_id)
    -- Legacy: Users with view_jobs can view their own jobs  
    OR (has_permission('view_jobs') AND auth.uid() = user_id)
  )
);