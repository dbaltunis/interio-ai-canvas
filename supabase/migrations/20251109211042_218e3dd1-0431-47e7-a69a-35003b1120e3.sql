-- Phase 1: Add template_id requirement and store visibility
-- Add template_id to store_product_visibility if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_product_visibility' 
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE store_product_visibility 
    ADD COLUMN template_id UUID REFERENCES curtain_templates(id);
  END IF;
END $$;

-- Phase 7: Add is_store_visible to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS is_store_visible BOOLEAN DEFAULT true;

-- Phase 5: Create store_category_settings table
CREATE TABLE IF NOT EXISTS store_category_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES online_stores(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  is_excluded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, category)
);

-- Enable RLS on store_category_settings
ALTER TABLE store_category_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_category_settings
CREATE POLICY "Users can view their own category settings"
ON store_category_settings FOR SELECT
USING (
  store_id IN (
    SELECT id FROM online_stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own category settings"
ON store_category_settings FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT id FROM online_stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own category settings"
ON store_category_settings FOR UPDATE
USING (
  store_id IN (
    SELECT id FROM online_stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own category settings"
ON store_category_settings FOR DELETE
USING (
  store_id IN (
    SELECT id FROM online_stores WHERE user_id = auth.uid()
  )
);

-- Phase 8: Enhance store_templates table
ALTER TABLE store_templates 
ADD COLUMN IF NOT EXISTS preview_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS demo_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_curtain_templates_store_visible 
ON curtain_templates(is_store_visible) WHERE is_store_visible = true;

CREATE INDEX IF NOT EXISTS idx_store_product_visibility_template 
ON store_product_visibility(template_id) WHERE template_id IS NOT NULL;