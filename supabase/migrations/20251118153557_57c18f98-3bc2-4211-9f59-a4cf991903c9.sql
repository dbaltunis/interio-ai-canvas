-- FIX 1: Update bug_reports RLS to show ALL bugs to admins/owners
-- The current is_admin() function is correct, but let's ensure the policy uses it properly

DROP POLICY IF EXISTS "Admins can view all bug reports" ON public.bug_reports;

CREATE POLICY "Admins and owners can view all bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (
  -- Admin check via is_admin function
  public.is_admin()
  OR
  -- Or user's own bugs
  auth.uid() = user_id
);