-- Add wallpaper to the allowed treatment categories
ALTER TABLE curtain_templates DROP CONSTRAINT IF EXISTS check_treatment_category;

ALTER TABLE curtain_templates ADD CONSTRAINT check_treatment_category 
CHECK (treatment_category IN (
  'curtains', 
  'roman_blinds', 
  'roller_blinds', 
  'venetian_blinds', 
  'vertical_blinds', 
  'shutters', 
  'panel_glide', 
  'cellular_shades',
  'wallpaper'
));

-- Now insert the wallpaper template
INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  pricing_type,
  unit_price,
  manufacturing_type,
  fabric_width_type,
  fabric_direction,
  fullness_ratio,
  heading_name,
  is_system_default,
  active,
  user_id,
  created_at,
  updated_at
)
SELECT 
  'Standard Wallpaper',
  'Basic wallpaper installation with standard paste application',
  'wallpaper',
  'wallpaper',
  'per_metre',
  35.00,
  'machine',
  'wide',
  'standard',
  1.0,
  'Standard',
  true,
  true,
  (SELECT user_id FROM curtain_templates WHERE is_system_default = true LIMIT 1),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM curtain_templates 
  WHERE treatment_category = 'wallpaper' AND is_system_default = true
);