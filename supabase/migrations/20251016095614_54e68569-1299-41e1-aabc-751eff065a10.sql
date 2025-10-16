-- First, update any invalid categories to a valid one or delete them
UPDATE curtain_templates 
SET treatment_category = 'curtains' 
WHERE treatment_category NOT IN (
  'curtains',
  'roller_blinds', 
  'roman_blinds',
  'venetian_blinds',
  'vertical_blinds',
  'cellular_shades',
  'plantation_shutters',
  'shutters',
  'panel_glide',
  'awning'
);

-- Now update the check constraint to include awning
ALTER TABLE curtain_templates 
DROP CONSTRAINT IF EXISTS check_treatment_category;

ALTER TABLE curtain_templates 
ADD CONSTRAINT check_treatment_category 
CHECK (treatment_category IN (
  'curtains',
  'roller_blinds', 
  'roman_blinds',
  'venetian_blinds',
  'vertical_blinds',
  'cellular_shades',
  'plantation_shutters',
  'shutters',
  'panel_glide',
  'awning'
));