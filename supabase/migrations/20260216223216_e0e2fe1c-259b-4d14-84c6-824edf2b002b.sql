
-- Add photos column to treatments table (array of up to 3 image URLs)
ALTER TABLE public.treatments ADD COLUMN photos text[] DEFAULT '{}';

-- Create storage bucket for treatment photos
INSERT INTO storage.buckets (id, name, public) VALUES ('treatment-photos', 'treatment-photos', true);

-- Storage RLS: Anyone can view treatment photos (public bucket)
CREATE POLICY "Treatment photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'treatment-photos');

-- Storage RLS: Authenticated users can upload treatment photos
CREATE POLICY "Authenticated users can upload treatment photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'treatment-photos' 
  AND auth.role() = 'authenticated'
);

-- Storage RLS: Users can update their own treatment photos
CREATE POLICY "Users can update their own treatment photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'treatment-photos' 
  AND auth.role() = 'authenticated'
);

-- Storage RLS: Users can delete their own treatment photos
CREATE POLICY "Users can delete their own treatment photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'treatment-photos' 
  AND auth.role() = 'authenticated'
);
