-- Add client credentials columns to shopify_integrations
ALTER TABLE public.shopify_integrations 
ADD COLUMN IF NOT EXISTS client_id text,
ADD COLUMN IF NOT EXISTS client_secret text,
ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.shopify_integrations.client_id IS 'Shopify app Client ID from Dev Dashboard';
COMMENT ON COLUMN public.shopify_integrations.client_secret IS 'Shopify app Client Secret from Dev Dashboard';
COMMENT ON COLUMN public.shopify_integrations.token_expires_at IS 'When the current access_token expires (24 hours from generation)';