-- Add bank account details columns to business_settings
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_bsb TEXT,
ADD COLUMN IF NOT EXISTS bank_sort_code TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_iban TEXT,
ADD COLUMN IF NOT EXISTS bank_swift_bic TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.business_settings.bank_bsb IS 'Australia: Bank State Branch code';
COMMENT ON COLUMN public.business_settings.bank_sort_code IS 'UK: Sort code';
COMMENT ON COLUMN public.business_settings.bank_routing_number IS 'US: ABA routing number';
COMMENT ON COLUMN public.business_settings.bank_iban IS 'EU/International: IBAN';
COMMENT ON COLUMN public.business_settings.bank_swift_bic IS 'International: SWIFT/BIC code';