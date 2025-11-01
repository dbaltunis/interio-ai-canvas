-- Add Shopify orders tracking table
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  total_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  customer_email TEXT,
  customer_name TEXT,
  order_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, shopify_order_id)
);

-- Add Shopify metadata to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS shopify_customer_id TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;

-- Add sync tracking table
CREATE TABLE IF NOT EXISTS public.shopify_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sync_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  items_synced INTEGER DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopify_orders
CREATE POLICY "Users can view their own Shopify orders"
  ON public.shopify_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Shopify orders"
  ON public.shopify_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Shopify orders"
  ON public.shopify_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Shopify orders"
  ON public.shopify_orders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for shopify_sync_log
CREATE POLICY "Users can view their own sync logs"
  ON public.shopify_sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON public.shopify_sync_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON public.shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_order_id ON public.shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_project_id ON public.shopify_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_client_id ON public.shopify_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_shopify_customer_id ON public.clients(shopify_customer_id) WHERE shopify_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopify_sync_log_user_id ON public.shopify_sync_log(user_id);

-- Trigger for updated_at on shopify_orders
CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();