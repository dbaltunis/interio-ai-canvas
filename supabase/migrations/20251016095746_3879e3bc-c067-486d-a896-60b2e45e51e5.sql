-- Add missing option type categories for awning
INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, active)
VALUES 
  ('awning', 'frame_type', 'Frame Type', true, true),
  ('awning', 'projection', 'Projection', true, true),
  ('awning', 'valance_style', 'Valance Style', true, true),
  ('awning', 'fabric_type', 'Fabric Type', true, true),
  ('awning', 'control_type', 'Control Type', true, true),
  ('awning', 'mounting_type', 'Mounting Type', true, true)
ON CONFLICT (treatment_category, type_key) DO NOTHING;