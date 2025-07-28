-- Create storage policies for email attachments

-- Policy for authenticated users to upload their own email attachments
CREATE POLICY "Users can upload email attachments" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'email-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for authenticated users to view their own email attachments  
CREATE POLICY "Users can view their own email attachments" ON storage.objects
FOR SELECT USING (
    bucket_id = 'email-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for authenticated users to update their own email attachments
CREATE POLICY "Users can update their own email attachments" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'email-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for authenticated users to delete their own email attachments
CREATE POLICY "Users can delete their own email attachments" ON storage.objects
FOR DELETE USING (
    bucket_id = 'email-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also allow system/service role to access all attachments for email sending
CREATE POLICY "System can access all email attachments" ON storage.objects
FOR ALL USING (
    bucket_id = 'email-attachments' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1] 
        OR auth.jwt() ->> 'role' = 'service_role'
    )
);