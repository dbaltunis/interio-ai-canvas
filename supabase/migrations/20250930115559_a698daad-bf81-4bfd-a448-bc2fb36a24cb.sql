-- Create storage bucket for business assets (logos, documents, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-assets', 'business-assets', true);

-- Create RLS policies for business assets bucket
CREATE POLICY "Anyone can view business assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-assets');

CREATE POLICY "Authenticated users can upload business assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own business assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own business assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business-assets' AND auth.uid() IS NOT NULL);