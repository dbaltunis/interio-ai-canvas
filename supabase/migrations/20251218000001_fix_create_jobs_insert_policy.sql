-- Fix: Ensure users with create_jobs permission can create jobs
-- Issue: Multiple INSERT policies may be conflicting
-- Solution: Drop all conflicting policies and ensure only the permission-based one exists

-- Drop all possible conflicting INSERT policies
DROP POLICY IF EXISTS "Account isolation - INSERT" ON public.projects;
DROP POLICY IF EXISTS "Permission-based project creation" ON public.projects;
DROP POLICY IF EXISTS "account_insert" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert projects based on permissions" ON public.projects;

-- Create a single, comprehensive INSERT policy that allows:
-- 1. Owners/Admins to create any project in their account
-- 2. Users with create_jobs permission to create their own projects
CREATE POLICY "Permission-based project creation" ON public.projects
FOR INSERT 
WITH CHECK (
  -- Must be in same account
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  AND (
    -- System Owners can create projects in their account
    get_user_role(auth.uid()) = 'System Owner'
    -- Account Owners can create projects in their account
    OR get_user_role(auth.uid()) = 'Owner'
    -- Admins can create projects in their account
    OR is_admin()
    -- Users with create_jobs permission can create their own projects
    OR (has_permission('create_jobs') AND auth.uid() = user_id)
  )
);

COMMENT ON POLICY "Permission-based project creation" ON public.projects IS 
'FIXED: Ensures users with create_jobs permission can create jobs. Drops all conflicting policies and creates a single comprehensive policy.';

