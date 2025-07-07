-- Create shopify_integrations table
CREATE TABLE public.shopify_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_domain TEXT NOT NULL,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_inventory BOOLEAN NOT NULL DEFAULT true,
  sync_prices BOOLEAN NOT NULL DEFAULT true,
  sync_images BOOLEAN NOT NULL DEFAULT true,
  last_full_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'idle',
  sync_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own shopify integrations"
ON public.shopify_integrations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_shopify_integrations_updated_at
BEFORE UPDATE ON public.shopify_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();