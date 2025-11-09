-- Create storage bucket for documentation screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentation-screenshots',
  'documentation-screenshots',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- Create RLS policies for documentation screenshots bucket
CREATE POLICY "Anyone can view documentation screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentation-screenshots');

CREATE POLICY "Authenticated users can upload documentation screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentation-screenshots' 
  AND auth.role() = 'authenticated'
);