-- ===== PHASE 1: Fix Database Constraint =====
-- Drop the incorrect global unique constraint
ALTER TABLE treatment_options 
DROP CONSTRAINT IF EXISTS treatment_options_category_key_unique;

-- Add the correct account-scoped constraint
ALTER TABLE treatment_options 
ADD CONSTRAINT treatment_options_account_category_key_unique 
UNIQUE (account_id, treatment_category, key);

-- ===== PHASE 2: Create System Defaults Master Table =====
CREATE TABLE IF NOT EXISTS system_default_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_category TEXT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  input_type TEXT NOT NULL DEFAULT 'select',
  description TEXT,
  default_values JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(treatment_category, key)
);

-- Enable RLS on system_default_options
ALTER TABLE system_default_options ENABLE ROW LEVEL SECURITY;

-- Only allow system operations to read from this table
CREATE POLICY "System defaults are read-only for functions"
  ON system_default_options
  FOR SELECT
  USING (true);

-- Populate System Defaults with Common Options
INSERT INTO system_default_options (treatment_category, key, label, input_type, description, default_values, sort_order) VALUES
-- Roller Blinds
('roller_blinds', 'control_type', 'Control Type', 'select', 'How the blind is operated', '[{"value": "chain", "label": "Chain Control"}, {"value": "motorized", "label": "Motorized"}, {"value": "spring", "label": "Spring Loaded"}]', 1),
('roller_blinds', 'mount_type', 'Mount Type', 'select', 'Where the blind is mounted', '[{"value": "inside", "label": "Inside Mount"}, {"value": "outside", "label": "Outside Mount"}]', 2),
('roller_blinds', 'chain_side', 'Chain Side', 'select', 'Side of the window for chain control', '[{"value": "left", "label": "Left"}, {"value": "right", "label": "Right"}]', 3),
('roller_blinds', 'fabric_type', 'Fabric Type', 'select', 'Type of roller blind fabric', '[{"value": "light_filtering", "label": "Light Filtering"}, {"value": "blockout", "label": "Blockout"}, {"value": "sunscreen", "label": "Sunscreen"}]', 4),

-- Roman Blinds  
('roman_blinds', 'fold_style', 'Fold Style', 'select', 'Style of roman blind folds', '[{"value": "flat", "label": "Flat Fold"}, {"value": "cascade", "label": "Cascade"}, {"value": "hobbled", "label": "Hobbled"}]', 1),
('roman_blinds', 'lining_type', 'Lining Type', 'select', 'Type of lining', '[{"value": "standard", "label": "Standard Lining"}, {"value": "blockout", "label": "Blockout Lining"}, {"value": "thermal", "label": "Thermal Lining"}]', 2),
('roman_blinds', 'control_type', 'Control Type', 'select', 'How the blind is operated', '[{"value": "cord", "label": "Cord Control"}, {"value": "chain", "label": "Chain Control"}, {"value": "motorized", "label": "Motorized"}]', 3),

-- Venetian Blinds
('venetian_blinds', 'slat_size', 'Slat Size', 'select', 'Width of the slats', '[{"value": "25mm", "label": "25mm"}, {"value": "50mm", "label": "50mm"}, {"value": "63mm", "label": "63mm"}]', 1),
('venetian_blinds', 'material', 'Material', 'select', 'Slat material', '[{"value": "aluminum", "label": "Aluminum"}, {"value": "wood", "label": "Wood"}, {"value": "faux_wood", "label": "Faux Wood"}]', 2),
('venetian_blinds', 'control_type', 'Control Type', 'select', 'How the blind is operated', '[{"value": "cord", "label": "Cord"}, {"value": "wand", "label": "Wand"}, {"value": "motorized", "label": "Motorized"}]', 3),

-- Vertical Blinds
('vertical_blinds', 'vane_width', 'Vane Width', 'select', 'Width of the vertical vanes', '[{"value": "89mm", "label": "89mm"}, {"value": "127mm", "label": "127mm"}]', 1),
('vertical_blinds', 'material', 'Material', 'select', 'Vane material', '[{"value": "fabric", "label": "Fabric"}, {"value": "pvc", "label": "PVC"}]', 2),
('vertical_blinds', 'control_type', 'Control Type', 'select', 'How the blind is operated', '[{"value": "cord", "label": "Cord Control"}, {"value": "wand", "label": "Wand Control"}, {"value": "motorized", "label": "Motorized"}]', 3),

-- Cellular/Honeycomb Blinds
('cellular_blinds', 'cell_type', 'Cell Type', 'select', 'Type of cellular construction', '[{"value": "single", "label": "Single Cell"}, {"value": "double", "label": "Double Cell"}]', 1),
('cellular_blinds', 'control_type', 'Control Type', 'select', 'How the blind is operated', '[{"value": "cordless", "label": "Cordless"}, {"value": "motorized", "label": "Motorized"}, {"value": "top_down_bottom_up", "label": "Top-Down Bottom-Up"}]', 2),
('cellular_blinds', 'mount_type', 'Mount Type', 'select', 'Where the blind is mounted', '[{"value": "inside", "label": "Inside Mount"}, {"value": "outside", "label": "Outside Mount"}]', 3),

-- Curtains
('curtains', 'heading_type', 'Heading Type', 'select', 'Style of curtain heading', '[{"value": "pencil_pleat", "label": "Pencil Pleat"}, {"value": "eyelet", "label": "Eyelet"}, {"value": "pinch_pleat", "label": "Pinch Pleat"}, {"value": "wave", "label": "Wave"}]', 1),
('curtains', 'lining_type', 'Lining Type', 'select', 'Type of curtain lining', '[{"value": "standard", "label": "Standard Lining"}, {"value": "blockout", "label": "Blockout Lining"}, {"value": "thermal", "label": "Thermal Lining"}, {"value": "none", "label": "Unlined"}]', 2),
('curtains', 'track_type', 'Track/Rod Type', 'select', 'Curtain hanging system', '[{"value": "track", "label": "Track System"}, {"value": "rod", "label": "Curtain Rod"}, {"value": "pole", "label": "Decorative Pole"}]', 3),

-- Shutters
('shutters', 'louver_size', 'Louver Size', 'select', 'Width of shutter louvers', '[{"value": "63mm", "label": "63mm (2.5 inch)"}, {"value": "89mm", "label": "89mm (3.5 inch)"}, {"value": "114mm", "label": "114mm (4.5 inch)"}]', 1),
('shutters', 'material', 'Material', 'select', 'Shutter material', '[{"value": "basswood", "label": "Basswood"}, {"value": "pvc", "label": "PVC"}, {"value": "aluminum", "label": "Aluminum"}]', 2),
('shutters', 'panel_config', 'Panel Configuration', 'select', 'Number and arrangement of panels', '[{"value": "single", "label": "Single Panel"}, {"value": "bi_fold", "label": "Bi-Fold"}, {"value": "tri_fold", "label": "Tri-Fold"}, {"value": "tracked", "label": "Tracked Panels"}]', 3),

-- Panel Glides
('panel_glide', 'panel_count', 'Number of Panels', 'select', 'How many sliding panels', '[{"value": "2", "label": "2 Panels"}, {"value": "3", "label": "3 Panels"}, {"value": "4", "label": "4 Panels"}]', 1),
('panel_glide', 'fabric_type', 'Fabric Type', 'select', 'Type of panel fabric', '[{"value": "light_filtering", "label": "Light Filtering"}, {"value": "blockout", "label": "Blockout"}, {"value": "sheer", "label": "Sheer"}]', 2),

-- Awnings
('awning', 'awning_type', 'Awning Type', 'select', 'Style of awning', '[{"value": "folding_arm", "label": "Folding Arm"}, {"value": "fixed", "label": "Fixed Awning"}, {"value": "straight_drop", "label": "Straight Drop"}]', 1),
('awning', 'control_type', 'Control Type', 'select', 'How the awning is operated', '[{"value": "manual", "label": "Manual Crank"}, {"value": "motorized", "label": "Motorized"}, {"value": "remote", "label": "Remote Control"}]', 2)

ON CONFLICT (treatment_category, key) DO NOTHING;

-- ===== PHASE 3: Implement Account Seeding Logic =====
CREATE OR REPLACE FUNCTION seed_account_options(target_account_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  options_created INTEGER := 0;
  default_option RECORD;
  new_option_id UUID;
BEGIN
  FOR default_option IN 
    SELECT * FROM system_default_options
    ORDER BY treatment_category, sort_order
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM treatment_options
      WHERE account_id = target_account_id
      AND treatment_category = default_option.treatment_category
      AND key = default_option.key
    ) THEN
      INSERT INTO treatment_options (
        account_id,
        treatment_category,
        key,
        label,
        input_type,
        description,
        sort_order
      ) VALUES (
        target_account_id,
        default_option.treatment_category,
        default_option.key,
        default_option.label,
        default_option.input_type,
        default_option.description,
        default_option.sort_order
      )
      RETURNING id INTO new_option_id;
      
      IF default_option.default_values IS NOT NULL AND jsonb_array_length(default_option.default_values) > 0 THEN
        INSERT INTO option_values (option_id, account_id, value, label, sort_order)
        SELECT 
          new_option_id,
          target_account_id,
          (item->>'value')::text,
          (item->>'label')::text,
          (row_number() OVER ())::integer
        FROM jsonb_array_elements(default_option.default_values) AS item;
      END IF;
      
      options_created := options_created + 1;
    END IF;
  END LOOP;
  
  RETURN options_created;
END;
$$;

-- ===== PHASE 4: Remove Legacy is_system_default Field =====
-- First, drop policies that depend on is_system_default
DROP POLICY IF EXISTS "Users can view system defaults and account options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update their account options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete their account options" ON treatment_options;

-- Now drop the column
ALTER TABLE treatment_options DROP COLUMN IF EXISTS is_system_default;

-- Ensure we have the correct minimal set of RLS policies
-- These policies should already exist from previous fixes, so use IF NOT EXISTS pattern
DO $$
BEGIN
  -- Check and create SELECT policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_options' 
    AND policyname = 'Users can view their account''s treatment options'
  ) THEN
    CREATE POLICY "Users can view their account's treatment options"
      ON treatment_options FOR SELECT
      USING (account_id = get_user_account_id(auth.uid()));
  END IF;

  -- Check and create INSERT policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_options' 
    AND policyname = 'Users can insert their account''s treatment options'
  ) THEN
    CREATE POLICY "Users can insert their account's treatment options"
      ON treatment_options FOR INSERT
      WITH CHECK (account_id = get_user_account_id(auth.uid()));
  END IF;

  -- Check and create UPDATE policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_options' 
    AND policyname = 'Users can update their account''s treatment options'
  ) THEN
    CREATE POLICY "Users can update their account's treatment options"
      ON treatment_options FOR UPDATE
      USING (account_id = get_user_account_id(auth.uid()))
      WITH CHECK (account_id = get_user_account_id(auth.uid()));
  END IF;

  -- Check and create DELETE policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_options' 
    AND policyname = 'Users can delete their account''s treatment options'
  ) THEN
    CREATE POLICY "Users can delete their account's treatment options"
      ON treatment_options FOR DELETE
      USING (account_id = get_user_account_id(auth.uid()));
  END IF;
END $$;