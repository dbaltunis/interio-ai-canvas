-- Phase 1: Shopify Integration + Feature-Based Subscriptions + Manual Quotation System

-- 1. Shopify Integrations Table
CREATE TABLE IF NOT EXISTS public.shopify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT,
  webhook_secret TEXT,
  is_connected BOOLEAN DEFAULT false,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_inventory BOOLEAN DEFAULT true,
  sync_prices BOOLEAN DEFAULT true,
  sync_images BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, shop_domain)
);

-- 2. Subscription Add-ons Table
CREATE TABLE IF NOT EXISTS public.subscription_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  feature_key TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. User Subscription Add-ons Junction Table
CREATE TABLE IF NOT EXISTS public.user_subscription_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES subscription_add_ons(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, add_on_id)
);

-- 4. Manual Quote Items Table
CREATE TABLE IF NOT EXISTS public.manual_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'unit',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Add features_included column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS features_included JSONB DEFAULT '{
  "crm": true,
  "quoting": true,
  "manual_quotes": true,
  "calendar": false,
  "email": false,
  "inventory": false,
  "window_treatments": false,
  "wallpapers": false,
  "shopify": false,
  "erp_integrations": false
}'::jsonb;

-- 6. Add per_user_pricing columns to subscription_plans
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS per_user_pricing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_users INTEGER;

-- 7. Add total_users to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS total_users INTEGER DEFAULT 1;

-- Enable Row Level Security
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_quote_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopify_integrations
CREATE POLICY "Users can view their own Shopify integrations"
  ON public.shopify_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Shopify integrations"
  ON public.shopify_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Shopify integrations"
  ON public.shopify_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Shopify integrations"
  ON public.shopify_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for subscription_add_ons (public read)
CREATE POLICY "Anyone can view active add-ons"
  ON public.subscription_add_ons FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscription_add_ons
CREATE POLICY "Users can view their own subscription add-ons"
  ON public.user_subscription_add_ons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription add-ons"
  ON public.user_subscription_add_ons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription add-ons"
  ON public.user_subscription_add_ons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription add-ons"
  ON public.user_subscription_add_ons FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for manual_quote_items
CREATE POLICY "Users can view their own manual quote items"
  ON public.manual_quote_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manual quote items"
  ON public.manual_quote_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manual quote items"
  ON public.manual_quote_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manual quote items"
  ON public.manual_quote_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_integrations_user_id ON public.shopify_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscription_add_ons_user_id ON public.user_subscription_add_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_quote_items_quote_id ON public.manual_quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_manual_quote_items_user_id ON public.manual_quote_items(user_id);

-- Insert default subscription add-ons
INSERT INTO public.subscription_add_ons (name, description, feature_key, price_monthly, price_yearly, display_order)
VALUES
  ('Email Integration', 'Send automated emails to clients', 'email', 5.00, 50.00, 1),
  ('Calendar Sync', 'Sync with Google, Apple, and Microsoft calendars', 'calendar', 5.00, 50.00, 2),
  ('Inventory Management', 'Track stock levels and manage inventory', 'inventory', 10.00, 100.00, 3),
  ('Window Treatments Module', 'Advanced window covering calculations', 'window_treatments', 15.00, 150.00, 4),
  ('Wallpapers Module', 'Wallpaper measurement and quoting', 'wallpapers', 10.00, 100.00, 5),
  ('Shopify Integration', 'Connect and sync with your Shopify store', 'shopify', 20.00, 200.00, 6),
  ('ERP Integrations', 'Connect to Xero, QuickBooks, and other ERPs', 'erp_integrations', 25.00, 250.00, 7)
ON CONFLICT (feature_key) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopify_integrations_updated_at
  BEFORE UPDATE ON public.shopify_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_add_ons_updated_at
  BEFORE UPDATE ON public.subscription_add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_quote_items_updated_at
  BEFORE UPDATE ON public.manual_quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();