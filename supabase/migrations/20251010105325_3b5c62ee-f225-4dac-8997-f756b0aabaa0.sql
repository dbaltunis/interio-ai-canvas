-- Standardize ALL treatment_category names to PLURAL in treatment_options
UPDATE treatment_options SET treatment_category = 'roller_blinds' WHERE treatment_category = 'roller_blind';
UPDATE treatment_options SET treatment_category = 'roman_blinds' WHERE treatment_category = 'roman_blind';
UPDATE treatment_options SET treatment_category = 'venetian_blinds' WHERE treatment_category = 'venetian_blind';
UPDATE treatment_options SET treatment_category = 'vertical_blinds' WHERE treatment_category = 'vertical_blind';
UPDATE treatment_options SET treatment_category = 'cellular_blinds' WHERE treatment_category IN ('cellular_shade', 'cellular_shades');
UPDATE treatment_options SET treatment_category = 'plantation_shutters' WHERE treatment_category = 'plantation_shutter';
UPDATE treatment_options SET treatment_category = 'shutters' WHERE treatment_category = 'shutter';
UPDATE treatment_options SET treatment_category = 'awning' WHERE treatment_category = 'awnings';
UPDATE treatment_options SET treatment_category = 'panel_glide' WHERE treatment_category = 'panel_glides';

-- Add treatment_category column to curtain_templates if it doesn't exist
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS treatment_category TEXT;

-- Populate treatment_category from curtain_type using standardized PLURAL names
UPDATE curtain_templates SET treatment_category = 
  CASE 
    WHEN curtain_type = 'roller_blind' THEN 'roller_blinds'
    WHEN curtain_type = 'roman_blind' THEN 'roman_blinds'
    WHEN curtain_type = 'venetian_blind' THEN 'venetian_blinds'
    WHEN curtain_type = 'vertical_blind' THEN 'vertical_blinds'
    WHEN curtain_type IN ('cellular_shade', 'cellular_shades') THEN 'cellular_blinds'
    WHEN curtain_type = 'plantation_shutter' THEN 'plantation_shutters'
    WHEN curtain_type = 'shutter' THEN 'shutters'
    WHEN curtain_type = 'awning' THEN 'awning'
    WHEN curtain_type = 'panel_glide' THEN 'panel_glide'
    WHEN curtain_type = 'curtain' THEN 'curtains'
    ELSE curtain_type
  END
WHERE treatment_category IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_curtain_templates_treatment_category ON curtain_templates(treatment_category);
CREATE INDEX IF NOT EXISTS idx_treatment_options_treatment_category ON treatment_options(treatment_category);