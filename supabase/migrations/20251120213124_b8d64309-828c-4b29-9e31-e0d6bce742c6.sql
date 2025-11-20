-- Add template_custom_data column to quotes table for storing block customizations
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS template_custom_data JSONB DEFAULT '{}'::jsonb;

-- Add index for better performance when querying custom data
CREATE INDEX IF NOT EXISTS idx_quotes_template_custom_data ON quotes USING gin(template_custom_data);

-- Create storage bucket for quote custom images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-custom-images',
  'quote-custom-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;