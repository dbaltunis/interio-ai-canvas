-- Create storage bucket for quote images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-images',
  'quote-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for quote images bucket
CREATE POLICY "Users can upload their own quote images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quote-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own quote images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'quote-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view quote images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quote-images');

CREATE POLICY "Users can update their own quote images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'quote-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own quote images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'quote-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create table to track quote images
CREATE TABLE IF NOT EXISTS public.quote_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quote_images
ALTER TABLE public.quote_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for quote_images
CREATE POLICY "Users can view their own quote images"
ON public.quote_images FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quote images"
ON public.quote_images FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quote images"
ON public.quote_images FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own quote images"
ON public.quote_images FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_images_quote_id ON public.quote_images(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_images_user_id ON public.quote_images(user_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_quote_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_images_updated_at
  BEFORE UPDATE ON public.quote_images
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_images_updated_at();