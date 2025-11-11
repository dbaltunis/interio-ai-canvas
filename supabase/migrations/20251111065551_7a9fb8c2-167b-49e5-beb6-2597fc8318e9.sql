-- Create storage bucket for bug report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-images', 'bug-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for bug images
CREATE POLICY "Anyone can view bug images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bug-images');

CREATE POLICY "Authenticated users can upload bug images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bug-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own bug images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bug-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete bug images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bug-images' 
  AND auth.role() = 'authenticated'
);

-- Add images column to bug_reports table
ALTER TABLE bug_reports 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add comment
COMMENT ON COLUMN bug_reports.images IS 'Array of image URLs from storage bucket';