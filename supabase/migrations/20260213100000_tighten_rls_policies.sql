-- Migration: Add missing DELETE policies on settings tables
--
-- NOTE: store_orders and email_analytics are NOT modified here.
--
-- store_orders: Has no user_id column. INSERT/UPDATE use WITH CHECK (true)
--   intentionally because orders are created by anonymous customers via Stripe
--   checkout edge functions (which use the service_role key and bypass RLS).
--   The SELECT policy already correctly scopes access through the
--   online_stores.user_id foreign key relationship.
--
-- email_analytics: Has no user_id column. A previous migration (20250807)
--   already replaced the overly permissive "System can insert analytics"
--   policy with a proper "Service role can insert analytics" policy that
--   checks auth.jwt() ->> 'role' = 'service_role' OR ownership via emails.user_id.

-- ============================================
-- 1. DELETE policy for business_settings
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_settings'
      AND policyname = 'Users can delete their own business settings'
  ) THEN
    CREATE POLICY "Users can delete their own business settings"
      ON public.business_settings
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 2. DELETE policy for integration_settings
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'integration_settings'
      AND policyname = 'Users can delete their own integrations'
  ) THEN
    CREATE POLICY "Users can delete their own integrations"
      ON public.integration_settings
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
