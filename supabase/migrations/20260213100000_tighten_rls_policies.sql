-- Migration: Tighten RLS policies for security audit gaps
-- 1. Add missing DELETE policies on settings tables
-- 2. Tighten overly permissive INSERT/UPDATE policies on store_orders and email_analytics

-- ============================================
-- 1. DELETE policies for business_settings
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
-- 2. DELETE policies for integration_settings
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

-- ============================================
-- 3. Tighten store_orders INSERT policy
--    Replace WITH CHECK (true) with user_id check
-- ============================================
DO $$
BEGIN
  -- Drop the overly permissive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Service role can insert orders'
  ) THEN
    DROP POLICY "Service role can insert orders" ON public.store_orders;
  END IF;

  -- Create proper policy: only insert your own orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Users can insert their own orders'
  ) THEN
    CREATE POLICY "Users can insert their own orders"
      ON public.store_orders
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Tighten store_orders UPDATE policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Service role can update orders'
  ) THEN
    DROP POLICY "Service role can update orders" ON public.store_orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'store_orders'
      AND policyname = 'Users can update their own orders'
  ) THEN
    CREATE POLICY "Users can update their own orders"
      ON public.store_orders
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 4. Tighten email_analytics INSERT policy
--    Replace WITH CHECK (true) with user_id check
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_analytics'
      AND policyname = 'System can insert analytics'
  ) THEN
    DROP POLICY "System can insert analytics" ON public.email_analytics;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_analytics'
      AND policyname = 'Users can insert their own analytics'
  ) THEN
    CREATE POLICY "Users can insert their own analytics"
      ON public.email_analytics
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
