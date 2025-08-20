-- Create storage policies for project-images bucket for user uploads
CREATE POLICY "Users can upload to project-images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Users can update their own project images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'project-images' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'project-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'project-images' AND (auth.uid())::text = (storage.foldername(name))[1]);