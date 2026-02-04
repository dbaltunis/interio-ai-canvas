-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Insert project activities" ON public.project_activity_log;

-- Create multi-tenant aware INSERT policy
-- Allows team members to log activities under their own ID for attribution
CREATE POLICY "project_activity_log_insert" ON public.project_activity_log
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  user_id = public.get_effective_account_owner(auth.uid())
);