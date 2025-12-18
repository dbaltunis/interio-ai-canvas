-- Create message-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload message attachments
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Policy for users to view message attachments
CREATE POLICY "Users can view message attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'message-attachments');

-- Policy for users to delete their own attachments
CREATE POLICY "Users can delete own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);