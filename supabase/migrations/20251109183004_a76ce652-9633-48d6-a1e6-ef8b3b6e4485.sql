-- Create store_orders table for online store purchases
CREATE TABLE IF NOT EXISTS public.store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.online_stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  message TEXT,
  order_items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

-- Store owners can view orders for their stores
CREATE POLICY "Store owners can view their orders"
  ON public.store_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.online_stores
      WHERE online_stores.id = store_orders.store_id
      AND online_stores.user_id = auth.uid()
    )
  );

-- Service role can insert orders (used by edge function)
CREATE POLICY "Service role can insert orders"
  ON public.store_orders
  FOR INSERT
  WITH CHECK (true);

-- Service role can update orders (used by edge function)
CREATE POLICY "Service role can update orders"
  ON public.store_orders
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_store_orders_store_id ON public.store_orders(store_id);
CREATE INDEX idx_store_orders_stripe_session_id ON public.store_orders(stripe_session_id);
CREATE INDEX idx_store_orders_payment_status ON public.store_orders(payment_status);

-- Create updated_at trigger
CREATE TRIGGER set_store_orders_updated_at
  BEFORE UPDATE ON public.store_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();