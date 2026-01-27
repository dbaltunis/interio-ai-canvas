-- Add storefront API key column to account_settings for external storefront authentication
ALTER TABLE public.account_settings 
ADD COLUMN IF NOT EXISTS storefront_api_key TEXT DEFAULT encode(gen_random_bytes(32), 'hex');

-- Generate keys for existing accounts that don't have one
UPDATE public.account_settings 
SET storefront_api_key = encode(gen_random_bytes(32), 'hex')
WHERE storefront_api_key IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.account_settings.storefront_api_key IS 'API key for external storefront integrations to authenticate requests';