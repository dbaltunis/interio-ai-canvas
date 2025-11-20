-- Fix bug_reports UPDATE policy to use correct admin check
-- Drop the old UPDATE policy that uses is_admin()
DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;

-- Create new UPDATE policy using is_bug_admin() function
CREATE POLICY "Bug reports update policy"
ON public.bug_reports
FOR UPDATE
TO authenticated
USING (
  public.is_bug_admin() = true OR auth.uid() = user_id
)
WITH CHECK (
  public.is_bug_admin() = true OR auth.uid() = user_id
);

-- Also ensure INSERT policy exists for bug creation
DROP POLICY IF EXISTS "Users can insert bug reports" ON public.bug_reports;

CREATE POLICY "Bug reports insert policy"
ON public.bug_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);