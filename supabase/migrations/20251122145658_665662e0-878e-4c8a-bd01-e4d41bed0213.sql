-- Create client-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to view their client files
CREATE POLICY "Users can view their client files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload their client files
CREATE POLICY "Users can upload their client files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their client files
CREATE POLICY "Users can update their client files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their client files
CREATE POLICY "Users can delete their client files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);