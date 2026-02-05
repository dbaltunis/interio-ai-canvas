-- Add quote_template field to business_settings for template style selection
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS quote_template VARCHAR(50) DEFAULT 'default';

-- Add new metadata fields to projects table for Homekaara template
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS services_required TEXT,
ADD COLUMN IF NOT EXISTS expected_purchase_date TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS intro_message TEXT,
ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS advance_paid DECIMAL(10,2) DEFAULT 0;

-- Add index for quick template lookup
CREATE INDEX IF NOT EXISTS idx_business_settings_quote_template ON public.business_settings(quote_template);

-- Create storage bucket for quote item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-images', 'quote-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for quote images
CREATE POLICY "Quote images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-images');

CREATE POLICY "Authenticated users can upload quote images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-images');

CREATE POLICY "Users can update their quote images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quote-images');

CREATE POLICY "Users can delete their quote images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quote-images');