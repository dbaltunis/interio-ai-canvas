-- Update vendors RLS policies to support team member access (parent_account_id)
-- This allows team members to see and manage the parent account's suppliers

-- Drop old single-user policy
DROP POLICY IF EXISTS "Users can manage their own vendors" ON public.vendors;

-- Create separate policies for team member support
CREATE POLICY "Users can view own and team vendors"
  ON public.vendors
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own and team vendors"
  ON public.vendors
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own and team vendors"
  ON public.vendors
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own and team vendors"
  ON public.vendors
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );
