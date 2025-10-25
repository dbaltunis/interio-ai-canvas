-- Add Shopify integration fields and default statuses (Simplified)

-- Add Shopify-related fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS shopify_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shopify_order_number VARCHAR(100);

-- Add Shopify-related fields to clients table  
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS shopify_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Create function to ensure default Shopify statuses exist for each user
CREATE OR REPLACE FUNCTION public.ensure_shopify_statuses(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert Online Store Lead status if it doesn't exist
  INSERT INTO public.job_statuses (
    user_id,
    name,
    color,
    description,
    is_active,
    sort_order
  )
  SELECT 
    p_user_id,
    'Online Store Lead',
    '#10b981',
    'Lead generated from online Shopify store',
    true,
    100
  WHERE NOT EXISTS (
    SELECT 1 FROM public.job_statuses 
    WHERE user_id = p_user_id AND name = 'Online Store Lead'
  );

  -- Insert Online Store Sale status if it doesn't exist
  INSERT INTO public.job_statuses (
    user_id,
    name,
    color,
    description,
    is_active,
    sort_order
  )
  SELECT 
    p_user_id,
    'Online Store Sale',
    '#3b82f6',
    'Completed sale from online Shopify store',
    true,
    101
  WHERE NOT EXISTS (
    SELECT 1 FROM public.job_statuses 
    WHERE user_id = p_user_id AND name = 'Online Store Sale'
  );
END;
$$;

-- Create trigger to automatically create default Shopify statuses for new users
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create default Shopify statuses for the new user
  PERFORM public.ensure_shopify_statuses(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created_shopify_statuses'
  ) THEN
    CREATE TRIGGER on_auth_user_created_shopify_statuses
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_shopify_statuses();
  END IF;
END;
$$;

-- Create Shopify analytics table for caching store analytics
CREATE TABLE IF NOT EXISTS public.shopify_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain VARCHAR(255) NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  orders_this_month INTEGER DEFAULT 0,
  revenue_this_month DECIMAL(12,2) DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  analytics_data JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shop_domain)
);

-- Enable RLS on shopify_analytics
ALTER TABLE public.shopify_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopify_analytics
CREATE POLICY "Users can view their own Shopify analytics"
ON public.shopify_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Shopify analytics"
ON public.shopify_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Shopify analytics"
ON public.shopify_analytics FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_shopify_order_id ON public.projects(shopify_order_id) WHERE shopify_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_shopify_customer_id ON public.clients(shopify_customer_id) WHERE shopify_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopify_analytics_user_shop ON public.shopify_analytics(user_id, shop_domain);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_shopify_analytics_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for updating updated_at
DROP TRIGGER IF EXISTS update_shopify_analytics_timestamp ON public.shopify_analytics;
CREATE TRIGGER update_shopify_analytics_timestamp
BEFORE UPDATE ON public.shopify_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_shopify_analytics_updated_at();

-- Create default statuses for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM public.ensure_shopify_statuses(user_record.id);
  END LOOP;
END;
$$;