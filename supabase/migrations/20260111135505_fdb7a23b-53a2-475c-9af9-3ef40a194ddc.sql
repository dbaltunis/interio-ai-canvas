-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own job statuses" ON job_statuses;
DROP POLICY IF EXISTS "Users can update their own job statuses" ON job_statuses;
DROP POLICY IF EXISTS "Users can delete their own job statuses" ON job_statuses;

-- Create new policies that support ALL team members
CREATE POLICY "Team members can view account job statuses" ON job_statuses
  FOR SELECT
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Team members can update account job statuses" ON job_statuses
  FOR UPDATE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Team members can delete account job statuses" ON job_statuses
  FOR DELETE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );