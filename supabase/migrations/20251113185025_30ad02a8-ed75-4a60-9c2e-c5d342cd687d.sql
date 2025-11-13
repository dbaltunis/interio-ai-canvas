-- Add manual quote editing settings to business_settings
-- This allows admins to enable/disable manual editing of quotes and invoices

-- Add the manual_quote_editing_enabled column
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS manual_quote_editing_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.business_settings.manual_quote_editing_enabled IS 'Enables manual editing of quote line items, quantities, prices, and all invoice fields. Only accessible by admins.';