-- Add document_language column to business_settings table
-- This allows users to set the language for their customer-facing documents (quotes, invoices, etc.)
-- Default is 'en' (English), also supports 'lt' (Lithuanian)

ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS document_language TEXT DEFAULT 'en';

-- Add a check constraint to validate allowed values
ALTER TABLE public.business_settings 
ADD CONSTRAINT check_document_language 
CHECK (document_language IS NULL OR document_language IN ('en', 'lt'));

COMMENT ON COLUMN public.business_settings.document_language IS 'Language for customer-facing documents. Default: en (English), also supports: lt (Lithuanian)';