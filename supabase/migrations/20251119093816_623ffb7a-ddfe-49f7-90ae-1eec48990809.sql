-- Add missing INSERT policies for treatment_options and option_values
CREATE POLICY "Users can insert their account's treatment options"
  ON treatment_options FOR INSERT
  TO authenticated
  WITH CHECK (
    account_id IN (
      SELECT bs.user_id 
      FROM business_settings bs 
      WHERE bs.user_id = auth.uid()
      UNION
      SELECT up.parent_account_id 
      FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.parent_account_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert their account's option values"
  ON option_values FOR INSERT
  TO authenticated
  WITH CHECK (
    account_id IN (
      SELECT bs.user_id 
      FROM business_settings bs 
      WHERE bs.user_id = auth.uid()
      UNION
      SELECT up.parent_account_id 
      FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.parent_account_id IS NOT NULL
    )
  );