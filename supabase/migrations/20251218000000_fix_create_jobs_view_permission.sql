-- Fix: Allow users with create_jobs permission to view jobs they created
-- Issue: Users with create_jobs but without view permissions couldn't see jobs they just created
-- Solution: Add condition to allow viewing own jobs if user has create_jobs permission

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Permission-based project access" ON public.projects;

-- Recreate with fix: Users can view jobs they created if they have create_jobs permission
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
    -- FIX: Users with create_jobs permission can view jobs they created
    OR (has_permission('create_jobs') AND auth.uid() = user_id)
  )
);

COMMENT ON POLICY "Permission-based project access" ON public.projects IS 
'FIXED: Added condition to allow users with create_jobs permission to view jobs they created. This ensures users can see jobs immediately after creating them, even without explicit view permissions.';

