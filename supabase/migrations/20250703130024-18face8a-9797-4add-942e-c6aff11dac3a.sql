-- Create storage policies for logo uploads in project-images bucket
CREATE POLICY "Users can upload logos to project-images bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'logos'
);

CREATE POLICY "Users can view logos in project-images bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-images' 
  AND (storage.foldername(name))[1] = 'logos'
);

CREATE POLICY "Users can update their own logos in project-images bucket" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'project-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'logos'
);

CREATE POLICY "Users can delete their own logos in project-images bucket" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'logos'
);