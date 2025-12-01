-- Fix pricing_grids RLS to support team sharing (Staff can see Owner's grids)
-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own pricing grids" ON pricing_grids;

-- Create account-based isolation policies
CREATE POLICY "Account isolation - SELECT"
ON pricing_grids FOR SELECT
USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - INSERT"
ON pricing_grids FOR INSERT
WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - UPDATE"
ON pricing_grids FOR UPDATE
USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id))
WITH CHECK (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));

CREATE POLICY "Account isolation - DELETE"
ON pricing_grids FOR DELETE
USING (get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id));