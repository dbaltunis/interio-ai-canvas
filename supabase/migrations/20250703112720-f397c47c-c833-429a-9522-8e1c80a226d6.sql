-- Add company logo field to business_settings table
ALTER TABLE public.business_settings 
ADD COLUMN company_logo_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.business_settings.company_logo_url IS 'URL to company logo for use in emails and quotes';