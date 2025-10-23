
-- Fix active_integrations column type mismatch
CREATE OR REPLACE FUNCTION public.sync_inventory_usage(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_period_start DATE;
BEGIN
  v_period_start := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Count from the correct 'inventory' table (not 'inventory_items')
  SELECT COUNT(*) 
  INTO v_count
  FROM inventory
  WHERE user_id = p_user_id;

  INSERT INTO user_usage_tracking (
    user_id,
    period_start,
    period_end,
    inventory_items_count,
    emails_sent_count,
    active_integrations
  )
  VALUES (
    p_user_id,
    v_period_start,
    v_period_start + INTERVAL '1 month' - INTERVAL '1 day',
    v_count,
    0,
    '[]'::jsonb  -- Cast to jsonb instead of text array
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    inventory_items_count = v_count,
    updated_at = NOW();
END;
$$;
