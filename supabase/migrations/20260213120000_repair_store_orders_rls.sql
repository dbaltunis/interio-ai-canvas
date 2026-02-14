-- Repair migration: Fix damage from failed 20260213100000 migration
--
-- The original version of that migration tried to replace store_orders
-- INSERT/UPDATE policies with auth.uid() = user_id checks, but store_orders
-- has no user_id column. The migration failed mid-execution. This migration
-- ensures:
-- 1. The broken "Users can insert their own orders" policy is removed (if it exists)
-- 2. The original service-role INSERT/UPDATE policies are restored
-- 3. The DELETE policies from the working part of that migration are ensured

-- ============================================
-- 1. Clean up any broken store_orders policies from the failed migration
-- ============================================
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.store_orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.store_orders;

-- ============================================
-- 2. Restore the correct INSERT policy for store_orders
--    Orders are created by Edge Functions using service_role key (bypass RLS)
--    and by anonymous Stripe checkout. WITH CHECK (true) is intentional.
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Service role can insert orders'
  ) THEN
    CREATE POLICY "Service role can insert orders"
      ON public.store_orders
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 3. Restore the correct UPDATE policy for store_orders
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Service role can update orders'
  ) THEN
    CREATE POLICY "Service role can update orders"
      ON public.store_orders
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 4. Ensure DELETE policies from the fixed migration exist (idempotent)
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
