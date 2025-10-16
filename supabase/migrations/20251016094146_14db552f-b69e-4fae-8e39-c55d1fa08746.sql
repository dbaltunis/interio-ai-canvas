-- First, create a unique constraint if it doesn't exist
ALTER TABLE option_type_categories 
DROP CONSTRAINT IF EXISTS option_type_categories_treatment_category_type_key_key;

ALTER TABLE option_type_categories 
ADD CONSTRAINT option_type_categories_treatment_category_type_key_key 
UNIQUE (treatment_category, type_key);

-- Now add missing option_type_categories for all treatment types
-- Panel Glide (PRIORITY)
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('panel_glide', 'panel_count', 'Number of Panels', true, true),
  ('panel_glide', 'track_type', 'Track Type', true, true),
  ('panel_glide', 'control_type', 'Control Type', true, true),
  ('panel_glide', 'fabric_type', 'Fabric Type', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Shutters
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('shutters', 'frame_type', 'Frame Type', true, true),
  ('shutters', 'louver_size', 'Louver Size', true, true),
  ('shutters', 'control_type', 'Control Type', true, true),
  ('shutters', 'mount_type', 'Mount Type', true, true),
  ('shutters', 'finish', 'Finish', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Awning
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('awning', 'frame_type', 'Frame Type', true, true),
  ('awning', 'control_type', 'Control Type', true, true),
  ('awning', 'fabric_pattern', 'Fabric Pattern', true, true),
  ('awning', 'valance_style', 'Valance Style', true, true),
  ('awning', 'projection', 'Projection', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Plantation Shutters
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('plantation_shutters', 'blade_size', 'Blade Size', true, true),
  ('plantation_shutters', 'control_type', 'Control Type', true, true),
  ('plantation_shutters', 'finish', 'Finish', true, true),
  ('plantation_shutters', 'frame_style', 'Frame Style', true, true),
  ('plantation_shutters', 'mount_type', 'Mount Type', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Cellular Shades
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('cellular_shades', 'cell_size', 'Cell Size', true, true),
  ('cellular_shades', 'motor_type', 'Motor Type', true, true),
  ('cellular_shades', 'mount_type', 'Mount Type', true, true),
  ('cellular_shades', 'opacity', 'Opacity', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Curtains
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('curtains', 'bracket_type', 'Bracket Type', true, true),
  ('curtains', 'motor_type', 'Motor Type', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Roman Blinds
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('roman_blinds', 'lift_system', 'Lift System', true, true),
  ('roman_blinds', 'mount_type', 'Mount Type', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Venetian Blinds
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('venetian_blinds', 'finish', 'Finish', true, true),
  ('venetian_blinds', 'material', 'Material', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Vertical Blinds
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('vertical_blinds', 'mount_type', 'Mount Type', true, true),
  ('vertical_blinds', 'slat_width', 'Slat Width', true, true),
  ('vertical_blinds', 'stack_direction', 'Stack Direction', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;

-- Clean up orphaned and test entries
DELETE FROM option_type_categories 
WHERE (treatment_category IS NULL AND type_key IN ('control_type', 'fabric_type', 'motor_type', 'mount_type', 'tube_size'))
   OR (treatment_category = 'roller_blinds' AND type_key = 'sdcx');