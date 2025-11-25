-- Delete cellular_shades treatment options (cellular_blinds has the complete set)
DELETE FROM treatment_options
WHERE treatment_category = 'cellular_shades';

-- Update cellular_shades templates to use cellular_blinds category
UPDATE curtain_templates
SET treatment_category = 'cellular_blinds'
WHERE treatment_category = 'cellular_shades';