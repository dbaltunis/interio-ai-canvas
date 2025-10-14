-- Add pricing_methods column to curtain_templates for multiple pricing configurations
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS pricing_methods JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN curtain_templates.pricing_methods IS 'Array of pricing method objects with name, type, and pricing data';