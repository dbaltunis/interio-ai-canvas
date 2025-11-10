-- Add page_structure column to store_product_visibility for custom product pages
ALTER TABLE store_product_visibility 
ADD COLUMN IF NOT EXISTS page_structure JSONB DEFAULT NULL;

COMMENT ON COLUMN store_product_visibility.page_structure IS 'Custom page structure for visual page builder - array of sections with type and content';
