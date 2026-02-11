-- Enhance service_options table with industry-standard fields for
-- made-to-measure blinds and curtains services

-- Add category column for service type classification
ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Add estimated duration for scheduling / calendar integration
ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;

-- Whether this service should offer calendar event creation
ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS is_schedulable BOOLEAN NOT NULL DEFAULT false;

-- Cost price for profit tracking alongside selling price
ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- Update RLS policy to support team members (parent_account_id)
-- Drop old policy
DROP POLICY IF EXISTS "Users can manage their own service options" ON public.service_options;

-- Create new policy that supports multi-tenant team access
CREATE POLICY "Users can view own and team service options"
  ON public.service_options
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own service options"
  ON public.service_options
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own and team service options"
  ON public.service_options
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

CREATE POLICY "Users can delete own and team service options"
  ON public.service_options
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );
