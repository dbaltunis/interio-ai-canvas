-- Add treatment_name column to treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS treatment_name text;

-- Add display_image_url to curtain_templates table
ALTER TABLE curtain_templates ADD COLUMN IF NOT EXISTS display_image_url text;

-- Add comment for documentation
COMMENT ON COLUMN treatments.treatment_name IS 'User-editable treatment name, defaults to template name';
COMMENT ON COLUMN curtain_templates.display_image_url IS 'URL for treatment product image display';