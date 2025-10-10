-- Step 1: Add treatment_category to treatment_options
ALTER TABLE treatment_options 
ADD COLUMN IF NOT EXISTS treatment_category TEXT;

-- Step 2: Add is_system_default flags
ALTER TABLE treatment_options 
ADD COLUMN IF NOT EXISTS is_system_default BOOLEAN DEFAULT false;

ALTER TABLE option_values 
ADD COLUMN IF NOT EXISTS is_system_default BOOLEAN DEFAULT false;

-- Step 3: Create option_type_categories table for dynamic option types
CREATE TABLE IF NOT EXISTS option_type_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  treatment_category TEXT NOT NULL,
  type_key TEXT NOT NULL,
  type_label TEXT NOT NULL,
  is_system_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique constraints separately
CREATE UNIQUE INDEX IF NOT EXISTS idx_option_type_system_unique 
  ON option_type_categories(treatment_category, type_key) 
  WHERE user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_option_type_user_unique 
  ON option_type_categories(treatment_category, type_key, user_id) 
  WHERE user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE option_type_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for option_type_categories
CREATE POLICY "Users can view system and own option types"
  ON option_type_categories FOR SELECT
  USING (is_system_default = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own option types"
  ON option_type_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own option types"
  ON option_type_categories FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own option types"
  ON option_type_categories FOR DELETE
  USING (user_id = auth.uid());

-- Step 4: Backfill treatment_category for existing options
UPDATE treatment_options to_update
SET treatment_category = ct.curtain_type
FROM curtain_templates ct
WHERE to_update.treatment_id = ct.id
  AND to_update.treatment_category IS NULL;

-- Step 5: Create function to seed system default option types
CREATE OR REPLACE FUNCTION seed_system_option_types()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Roller Blinds
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('roller_blind', 'tube_size', 'Tube Sizes', true, NULL),
  ('roller_blind', 'mount_type', 'Mount Types', true, NULL),
  ('roller_blind', 'control_type', 'Control Types', true, NULL),
  ('roller_blind', 'fascia_type', 'Fascia Types', true, NULL),
  ('roller_blind', 'bracket_type', 'Bracket Types', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Roman Blinds
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('roman_blind', 'fold_style', 'Fold Styles', true, NULL),
  ('roman_blind', 'lining_type', 'Lining Types', true, NULL),
  ('roman_blind', 'control_type', 'Control Types', true, NULL),
  ('roman_blind', 'headrail_type', 'Headrail Types', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Venetian Blinds
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('venetian_blind', 'slat_size', 'Slat Sizes', true, NULL),
  ('venetian_blind', 'material_type', 'Material Types', true, NULL),
  ('venetian_blind', 'control_type', 'Control Types', true, NULL),
  ('venetian_blind', 'mount_type', 'Mount Types', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Vertical Blinds
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('vertical_blind', 'vane_width', 'Vane Widths', true, NULL),
  ('vertical_blind', 'control_type', 'Control Types', true, NULL),
  ('vertical_blind', 'track_type', 'Track Types', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Plantation Shutters
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('plantation_shutter', 'louver_size', 'Louver Sizes', true, NULL),
  ('plantation_shutter', 'frame_type', 'Frame Types', true, NULL),
  ('plantation_shutter', 'hinge_type', 'Hinge Types', true, NULL),
  ('plantation_shutter', 'tilt_rod', 'Tilt Rod Options', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Cellular Shades
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('cellular_shade', 'cell_type', 'Cell Types', true, NULL),
  ('cellular_shade', 'control_type', 'Control Types', true, NULL),
  ('cellular_shade', 'opacity_level', 'Opacity Levels', true, NULL)
  ON CONFLICT DO NOTHING;

  -- Curtains
  INSERT INTO option_type_categories (treatment_category, type_key, type_label, is_system_default, user_id) VALUES
  ('curtains', 'heading_type', 'Heading Types', true, NULL),
  ('curtains', 'lining_type', 'Lining Types', true, NULL),
  ('curtains', 'track_type', 'Track Types', true, NULL),
  ('curtains', 'fullness', 'Fullness Options', true, NULL)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Run the seed function
SELECT seed_system_option_types();

-- Step 6: Create function to seed default option values for roller blinds
CREATE OR REPLACE FUNCTION seed_roller_blind_defaults()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tube_option_id UUID;
  mount_option_id UUID;
  control_option_id UUID;
  fascia_option_id UUID;
  bracket_option_id UUID;
BEGIN
  -- Create treatment options for roller blinds
  INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
  VALUES ('roller_blind', 'tube_size', 'Tube Size', 'select', true, true, true, 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO tube_option_id;

  INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
  VALUES ('roller_blind', 'mount_type', 'Mount Type', 'select', true, true, true, 2)
  ON CONFLICT DO NOTHING
  RETURNING id INTO mount_option_id;

  INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
  VALUES ('roller_blind', 'control_type', 'Control Type', 'select', true, true, true, 3)
  ON CONFLICT DO NOTHING
  RETURNING id INTO control_option_id;

  INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
  VALUES ('roller_blind', 'fascia_type', 'Fascia', 'select', true, false, true, 4)
  ON CONFLICT DO NOTHING
  RETURNING id INTO fascia_option_id;

  INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
  VALUES ('roller_blind', 'bracket_type', 'Brackets', 'select', true, false, true, 5)
  ON CONFLICT DO NOTHING
  RETURNING id INTO bracket_option_id;

  -- Get IDs if they already exist
  IF tube_option_id IS NULL THEN
    SELECT id INTO tube_option_id FROM treatment_options WHERE treatment_category = 'roller_blind' AND key = 'tube_size' LIMIT 1;
  END IF;
  IF mount_option_id IS NULL THEN
    SELECT id INTO mount_option_id FROM treatment_options WHERE treatment_category = 'roller_blind' AND key = 'mount_type' LIMIT 1;
  END IF;
  IF control_option_id IS NULL THEN
    SELECT id INTO control_option_id FROM treatment_options WHERE treatment_category = 'roller_blind' AND key = 'control_type' LIMIT 1;
  END IF;
  IF fascia_option_id IS NULL THEN
    SELECT id INTO fascia_option_id FROM treatment_options WHERE treatment_category = 'roller_blind' AND key = 'fascia_type' LIMIT 1;
  END IF;
  IF bracket_option_id IS NULL THEN
    SELECT id INTO bracket_option_id FROM treatment_options WHERE treatment_category = 'roller_blind' AND key = 'bracket_type' LIMIT 1;
  END IF;

  -- Tube sizes
  INSERT INTO option_values (option_id, code, label, extra_data, is_system_default, order_index) VALUES
  (tube_option_id, '25mm', '25mm Tube', '{"price": 0}'::jsonb, true, 1),
  (tube_option_id, '38mm', '38mm Tube', '{"price": 15}'::jsonb, true, 2),
  (tube_option_id, '45mm', '45mm Tube', '{"price": 25}'::jsonb, true, 3)
  ON CONFLICT DO NOTHING;

  -- Mount types
  INSERT INTO option_values (option_id, code, label, extra_data, is_system_default, order_index) VALUES
  (mount_option_id, 'inside', 'Inside Mount', '{"price": 0}'::jsonb, true, 1),
  (mount_option_id, 'outside', 'Outside Mount', '{"price": 10}'::jsonb, true, 2),
  (mount_option_id, 'ceiling', 'Ceiling Mount', '{"price": 15}'::jsonb, true, 3)
  ON CONFLICT DO NOTHING;

  -- Control types
  INSERT INTO option_values (option_id, code, label, extra_data, is_system_default, order_index) VALUES
  (control_option_id, 'chain', 'Chain Control', '{"price": 0}'::jsonb, true, 1),
  (control_option_id, 'spring', 'Spring Control', '{"price": 20}'::jsonb, true, 2),
  (control_option_id, 'motorized', 'Motorized', '{"price": 150}'::jsonb, true, 3)
  ON CONFLICT DO NOTHING;

  -- Fascia types
  INSERT INTO option_values (option_id, code, label, extra_data, is_system_default, order_index) VALUES
  (fascia_option_id, 'none', 'No Fascia', '{"price": 0}'::jsonb, true, 1),
  (fascia_option_id, 'standard', 'Standard Fascia', '{"price": 30}'::jsonb, true, 2),
  (fascia_option_id, 'designer', 'Designer Fascia', '{"price": 50}'::jsonb, true, 3)
  ON CONFLICT DO NOTHING;

  -- Bracket types
  INSERT INTO option_values (option_id, code, label, extra_data, is_system_default, order_index) VALUES
  (bracket_option_id, 'standard', 'Standard Brackets', '{"price": 0}'::jsonb, true, 1),
  (bracket_option_id, 'heavy_duty', 'Heavy Duty Brackets', '{"price": 15}'::jsonb, true, 2)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Run roller blind defaults
SELECT seed_roller_blind_defaults();