-- Create client-files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access for client-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to client-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own client-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own client-files" ON storage.objects;

-- Policy: Anyone can view files in client-files bucket (since it's public)
CREATE POLICY "Public Access for client-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-files');

-- Policy: Authenticated users can upload their own files
CREATE POLICY "Users can upload to client-files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own client-files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own client-files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);