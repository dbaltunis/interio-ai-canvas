-- Add tax_rate and tax_type to business_settings table
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_type text DEFAULT 'none' CHECK (tax_type IN ('none', 'vat', 'gst', 'sales_tax'));

-- Add comment for clarity
COMMENT ON COLUMN public.business_settings.tax_rate IS 'Tax rate percentage (e.g., 20 for 20% VAT/GST)';
COMMENT ON COLUMN public.business_settings.tax_type IS 'Type of tax: none, vat (Value Added Tax), gst (Goods and Services Tax), or sales_tax';