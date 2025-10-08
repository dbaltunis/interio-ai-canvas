-- Drop the old pricing_type check constraint
ALTER TABLE curtain_templates 
DROP CONSTRAINT IF EXISTS curtain_templates_pricing_type_check;

-- Add updated check constraint with blind/shutter pricing types
ALTER TABLE curtain_templates 
ADD CONSTRAINT curtain_templates_pricing_type_check 
CHECK (pricing_type IN (
  'per_metre', 
  'per_drop', 
  'per_panel', 
  'height_based', 
  'pricing_grid', 
  'per_sqm', 
  'per_unit'
));