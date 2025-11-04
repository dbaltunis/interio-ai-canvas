
-- Add image_url column to treatment_templates for category-level default images
ALTER TABLE treatment_templates
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN treatment_templates.image_url IS 'Default category image shared by all templates in this category unless overridden';

-- Add image_url to curtain_templates if it doesn't exist (for individual template customization)
-- This already exists, but we'll ensure display_image_url is used properly
COMMENT ON COLUMN curtain_templates.image_url IS 'Custom image for this specific template, overrides category default';
COMMENT ON COLUMN curtain_templates.display_image_url IS 'Display image used in quotes and worksheets';
