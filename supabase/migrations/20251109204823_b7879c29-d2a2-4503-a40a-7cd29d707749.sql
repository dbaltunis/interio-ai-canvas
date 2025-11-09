-- Add template_id to store_product_visibility
ALTER TABLE store_product_visibility 
ADD COLUMN template_id UUID REFERENCES curtain_templates(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_store_product_template ON store_product_visibility(template_id);

-- Add comment for clarity
COMMENT ON COLUMN store_product_visibility.template_id IS 'Links a fabric to a specific curtain template to display as a finished product (e.g., Roller Blind - Fabric Name)';