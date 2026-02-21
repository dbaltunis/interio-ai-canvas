-- Fix pricing_grids RLS to support multi-tenant accounts
-- Previously: only the grid creator (user_id = auth.uid()) could access grids
-- Now: team members can also access grids owned by their parent account

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can manage their own pricing grids" ON pricing_grids;

-- Create new policy that also allows team members to read/write the account owner's grids
CREATE POLICY "Users can access pricing grids in their account"
  ON pricing_grids
  FOR ALL
  USING (
    -- Direct ownership
    auth.uid() = user_id
    OR
    -- Team member accessing parent account's grids
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
        AND parent_account_id = pricing_grids.user_id
    )
  )
  WITH CHECK (
    -- Direct ownership
    auth.uid() = user_id
    OR
    -- Team member writing to parent account's grids
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
        AND parent_account_id = pricing_grids.user_id
    )
  );
