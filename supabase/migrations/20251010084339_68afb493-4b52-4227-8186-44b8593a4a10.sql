-- Phase 1: Clean up database and standardize

-- Delete duplicate user templates (keep only the first one for each category)
DELETE FROM curtain_templates 
WHERE user_id IN (
  SELECT DISTINCT user_id FROM curtain_templates WHERE is_system_default = false
)
AND is_system_default = false
AND id NOT IN (
  SELECT DISTINCT ON (user_id, treatment_category) id 
  FROM curtain_templates 
  WHERE is_system_default = false
  ORDER BY user_id, treatment_category, created_at ASC
);

-- Delete ALL template-specific options (they cause duplication on clone)
DELETE FROM treatment_options 
WHERE template_id IS NOT NULL;

-- Standardize treatment_category naming to plural forms
UPDATE treatment_options 
SET treatment_category = 'roller_blinds' 
WHERE treatment_category = 'roller_blind';

UPDATE treatment_options 
SET treatment_category = 'roman_blinds' 
WHERE treatment_category = 'roman_blind';

UPDATE treatment_options 
SET treatment_category = 'venetian_blinds' 
WHERE treatment_category = 'venetian_blind';

UPDATE treatment_options 
SET treatment_category = 'vertical_blinds' 
WHERE treatment_category = 'vertical_blind';

UPDATE treatment_options 
SET treatment_category = 'cellular_shades' 
WHERE treatment_category = 'cellular_shade';

UPDATE curtain_templates 
SET treatment_category = 'roller_blinds' 
WHERE treatment_category = 'roller_blind';

UPDATE curtain_templates 
SET treatment_category = 'roman_blinds' 
WHERE treatment_category = 'roman_blind';

UPDATE curtain_templates 
SET treatment_category = 'venetian_blinds' 
WHERE treatment_category = 'venetian_blind';

UPDATE curtain_templates 
SET treatment_category = 'vertical_blinds' 
WHERE treatment_category = 'vertical_blind';

UPDATE curtain_templates 
SET treatment_category = 'cellular_shades' 
WHERE treatment_category = 'cellular_shade';