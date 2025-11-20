-- Add overlap column to product_templates table
-- This stores the centre overlap value for curtain templates

ALTER TABLE product_templates 
ADD COLUMN IF NOT EXISTS overlap numeric DEFAULT 10;

COMMENT ON COLUMN product_templates.overlap IS 'Centre overlap in centimeters for curtain pairs';
