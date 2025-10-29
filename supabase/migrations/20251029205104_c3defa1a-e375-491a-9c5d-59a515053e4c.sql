-- Create storage bucket for eyelet ring images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'eyelet-ring-images',
  'eyelet-ring-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for eyelet ring images
DO $$ 
BEGIN
  -- Allow public to view images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Eyelet ring images are publicly accessible'
  ) THEN
    CREATE POLICY "Eyelet ring images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'eyelet-ring-images');
  END IF;

  -- Allow authenticated users to upload their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own eyelet ring images'
  ) THEN
    CREATE POLICY "Users can upload their own eyelet ring images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'eyelet-ring-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to update their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own eyelet ring images'
  ) THEN
    CREATE POLICY "Users can update their own eyelet ring images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'eyelet-ring-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to delete their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own eyelet ring images'
  ) THEN
    CREATE POLICY "Users can delete their own eyelet ring images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'eyelet-ring-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Function to load popular headings for a user
CREATE OR REPLACE FUNCTION load_default_headings_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert popular heading templates for the user
  INSERT INTO enhanced_inventory_items (
    user_id,
    name,
    description,
    category,
    subcategory,
    cost_price,
    selling_price,
    fullness_ratio,
    unit,
    active,
    show_in_quote
  )
  SELECT 
    target_user_id,
    name,
    description,
    category,
    subcategory,
    (pricing->>'cost_price')::numeric,
    (pricing->>'selling_price')::numeric,
    (specifications->>'fullness_ratio')::numeric,
    'meters',
    true,
    true
  FROM default_inventory_templates
  WHERE category = 'heading' 
    AND is_popular = true
    AND active = true
  ON CONFLICT DO NOTHING;
END;
$$;