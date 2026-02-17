
-- Create the imports storage bucket for chunked CSV uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the imports bucket
CREATE POLICY "Authenticated users can upload import files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imports' AND auth.role() = 'authenticated');

-- Allow authenticated users to read import files
CREATE POLICY "Authenticated users can read import files"
ON storage.objects FOR SELECT
USING (bucket_id = 'imports' AND auth.role() = 'authenticated');

-- Allow authenticated users to update import files (for append)
CREATE POLICY "Authenticated users can update import files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'imports' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete import files (cleanup)
CREATE POLICY "Authenticated users can delete import files"
ON storage.objects FOR DELETE
USING (bucket_id = 'imports' AND auth.role() = 'authenticated');
