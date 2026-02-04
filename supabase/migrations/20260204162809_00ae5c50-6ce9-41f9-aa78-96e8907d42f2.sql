-- ============================================================
-- Step 1: FIRST fix the broken Shopify trigger function
-- This must happen BEFORE any profile inserts
-- ============================================================

-- Fix the create_default_shopify_statuses function to handle missing table
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run for account owners (no parent_account_id)
  IF NEW.parent_account_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if table exists before querying - prevent crash when table doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'shopify_sync_statuses'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Wrap in exception handler for any other issues
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM shopify_sync_statuses WHERE user_id = NEW.user_id) THEN
      INSERT INTO shopify_sync_statuses (user_id, job_status, sync_to_shopify, created_at)
      VALUES 
        (NEW.user_id, 'Quoted', false, now()),
        (NEW.user_id, 'Approved', false, now()),
        (NEW.user_id, 'In Progress', false, now()),
        (NEW.user_id, 'Completed', true, now())
      ON CONFLICT DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'create_default_shopify_statuses error for %: %', NEW.user_id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;