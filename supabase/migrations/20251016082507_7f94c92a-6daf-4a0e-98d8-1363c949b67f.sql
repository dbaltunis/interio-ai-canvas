-- Add option type categories for awnings
DO $$
BEGIN
  -- Awnings - option type categories
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('awning', 'frame_type', 'Frame Type', true, NULL),
  ('awning', 'control_type', 'Control Type', true, NULL),
  ('awning', 'fabric_pattern', 'Fabric Pattern', true, NULL),
  ('awning', 'valance_style', 'Valance Style', true, NULL),
  ('awning', 'projection', 'Projection', true, NULL)
  ON CONFLICT (treatment_category, type_key) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting awning option type categories: %', SQLERRM;
END $$;