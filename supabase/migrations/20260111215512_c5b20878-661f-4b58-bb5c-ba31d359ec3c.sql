-- Update check constraint to include zebra_blinds
ALTER TABLE curtain_templates DROP CONSTRAINT IF EXISTS check_treatment_category;

ALTER TABLE curtain_templates ADD CONSTRAINT check_treatment_category CHECK (
  treatment_category IS NULL OR 
  treatment_category IN (
    'curtains', 'roman_blinds', 'roller_blinds', 'zebra_blinds', 'venetian_blinds', 
    'vertical_blinds', 'cellular_blinds', 'cellular_shades', 'panel_glide', 
    'plantation_shutters', 'shutters', 'awning', 'wallpaper'
  )
);

-- Update the Zebra template
UPDATE curtain_templates 
SET treatment_category = 'zebra_blinds', updated_at = NOW()
WHERE id = 'fe9d007c-46ec-4960-adfd-6f3038d63c1c';