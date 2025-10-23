-- Fix security warnings: Add search_path to functions

-- Update get_current_usage function
CREATE OR REPLACE FUNCTION get_current_usage(p_user_id UUID)
RETURNS user_usage_tracking AS $$
DECLARE
  current_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  current_period_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
  usage_record user_usage_tracking;
BEGIN
  SELECT * INTO usage_record
  FROM user_usage_tracking
  WHERE user_id = p_user_id
    AND period_start = current_period_start;
  
  IF NOT FOUND THEN
    INSERT INTO user_usage_tracking (user_id, period_start, period_end)
    VALUES (p_user_id, current_period_start, current_period_end)
    RETURNING * INTO usage_record;
  END IF;
  
  RETURN usage_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update increment_email_usage function
CREATE OR REPLACE FUNCTION increment_email_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  current_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  current_period_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
BEGIN
  INSERT INTO user_usage_tracking (user_id, period_start, period_end, emails_sent_count)
  VALUES (p_user_id, current_period_start, current_period_end, 1)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET 
    emails_sent_count = user_usage_tracking.emails_sent_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update sync_inventory_usage function
CREATE OR REPLACE FUNCTION sync_inventory_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  current_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  current_period_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
  item_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO item_count
  FROM inventory_items
  WHERE user_id = p_user_id;
  
  INSERT INTO user_usage_tracking (user_id, period_start, period_end, inventory_items_count)
  VALUES (p_user_id, current_period_start, current_period_end, item_count)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET 
    inventory_items_count = item_count,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_usage_tracking_updated_at function
CREATE OR REPLACE FUNCTION update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;