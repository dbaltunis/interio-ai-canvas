-- Phase 1.5: Per-User Pricing + Usage-Based Add-Ons System

-- 1. Update subscription_plans table with per-user pricing
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS per_user_pricing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS base_price_per_user DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS included_users INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_inventory_items INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_emails_per_month INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS features_included JSONB DEFAULT '{}'::jsonb;

-- Update existing plans with new pricing structure
UPDATE subscription_plans SET 
  per_user_pricing = true,
  base_price_per_user = 49.00,
  price_monthly = 49.00,
  included_users = 1,
  max_inventory_items = 100,
  max_emails_per_month = 50,
  features_included = '{"crm": true, "manual_quotes": true, "basic_inventory": true, "quoting": true}'::jsonb
WHERE name = 'Professional';

UPDATE subscription_plans SET 
  per_user_pricing = true,
  base_price_per_user = 99.00,
  price_monthly = 99.00,
  included_users = 1,
  max_inventory_items = 500,
  max_emails_per_month = 200,
  features_included = '{"crm": true, "manual_quotes": true, "window_treatments": true, "advanced_inventory": true, "calendar": true, "quoting": true, "email": true}'::jsonb
WHERE name = 'Business';

-- 2. Add add_on_type column to subscription_add_ons
ALTER TABLE subscription_add_ons 
ADD COLUMN IF NOT EXISTS add_on_type TEXT DEFAULT 'feature' CHECK (add_on_type IN ('feature', 'capacity', 'integration'));

-- Update existing add-ons with correct types
UPDATE subscription_add_ons SET add_on_type = 'integration' WHERE feature_key IN ('shopify', 'calendar', 'email');
UPDATE subscription_add_ons SET add_on_type = 'feature' WHERE feature_key IN ('window_treatments', 'wallpapers', 'erp_integrations');

-- 3. Insert capacity-based add-ons
INSERT INTO subscription_add_ons (name, description, feature_key, price_monthly, price_yearly, add_on_type, is_active, display_order)
VALUES
  ('Inventory Boost 1K', 'Increase inventory limit to 1,000 products', 'inventory_1000', 19.00, 190.00, 'capacity', true, 10),
  ('Inventory Boost Unlimited', 'Unlimited inventory products', 'inventory_unlimited', 49.00, 490.00, 'capacity', true, 11),
  ('Email Pack 500', 'Send up to 500 emails per month', 'emails_500', 15.00, 150.00, 'capacity', true, 12),
  ('Email Pack Unlimited', 'Unlimited email sending', 'emails_unlimited', 39.00, 390.00, 'capacity', true, 13),
  ('QuickBooks Integration', 'Sync with QuickBooks Online', 'quickbooks', 29.00, 290.00, 'integration', true, 14)
ON CONFLICT (feature_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  add_on_type = EXCLUDED.add_on_type;

-- 4. Create user_usage_tracking table
CREATE TABLE IF NOT EXISTS user_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  inventory_items_count INTEGER DEFAULT 0,
  emails_sent_count INTEGER DEFAULT 0,
  active_integrations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS on usage tracking
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage tracking
CREATE POLICY "Users can view their own usage"
  ON user_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usage_tracking_timestamp ON user_usage_tracking;
CREATE TRIGGER update_usage_tracking_timestamp
  BEFORE UPDATE ON user_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking_updated_at();

-- 5. Function to get or create current usage period
CREATE OR REPLACE FUNCTION get_current_usage(p_user_id UUID)
RETURNS user_usage_tracking AS $$
DECLARE
  current_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  current_period_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
  usage_record user_usage_tracking;
BEGIN
  -- Try to get existing record
  SELECT * INTO usage_record
  FROM user_usage_tracking
  WHERE user_id = p_user_id
    AND period_start = current_period_start;
  
  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO user_usage_tracking (user_id, period_start, period_end)
    VALUES (p_user_id, current_period_start, current_period_end)
    RETURNING * INTO usage_record;
  END IF;
  
  RETURN usage_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to increment email count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to sync inventory count
CREATE OR REPLACE FUNCTION sync_inventory_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  current_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  current_period_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
  item_count INTEGER;
BEGIN
  -- Count current inventory items
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
$$ LANGUAGE plpgsql SECURITY DEFINER;