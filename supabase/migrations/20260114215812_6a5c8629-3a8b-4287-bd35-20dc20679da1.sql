-- Add terms and conditions columns to business_settings
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS general_terms_and_conditions TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy TEXT;