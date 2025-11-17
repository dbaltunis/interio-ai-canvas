-- Phase 2: Create Material Options with Inventory Tracking

-- Update existing material options to track inventory
UPDATE treatment_options 
SET 
  tracks_inventory = true,
  pricing_method = 'per-sqm'
WHERE treatment_category = 'venetian_blinds' 
  AND key = 'material'
  AND is_system_default = true;

UPDATE treatment_options 
SET 
  tracks_inventory = true,
  pricing_method = 'per-sqm'
WHERE treatment_category = 'vertical_blinds' 
  AND key = 'material'
  AND is_system_default = true;

UPDATE treatment_options 
SET 
  tracks_inventory = true,
  pricing_method = 'per-panel'
WHERE treatment_category = 'shutters' 
  AND key = 'material'
  AND is_system_default = true;

-- Update option_values extra_data for existing materials
UPDATE option_values
SET extra_data = jsonb_set(
  COALESCE(extra_data, '{}'::jsonb),
  '{pricing_method}',
  '"per-sqm"'
)
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE treatment_category IN ('venetian_blinds', 'vertical_blinds')
    AND key = 'material'
    AND is_system_default = true
);

UPDATE option_values
SET extra_data = jsonb_set(
  COALESCE(extra_data, '{}'::jsonb),
  '{pricing_method}',
  '"per-panel"'
)
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE treatment_category = 'shutters'
    AND key = 'material'
    AND is_system_default = true
);

-- Insert material option for Cellular Shades
DO $$
DECLARE
  cellular_material_option_id uuid;
BEGIN
  -- Insert or get cellular shades material option
  INSERT INTO treatment_options (
    key, label, input_type, required, visible, order_index,
    treatment_category, is_system_default, tracks_inventory, pricing_method
  )
  VALUES (
    'cell_material', 'Cell Material', 'select', true, true, 3,
    'cellular_shades', true, true, 'per-sqm'
  )
  ON CONFLICT (treatment_category, key) WHERE template_id IS NULL
  DO UPDATE SET 
    tracks_inventory = true,
    pricing_method = 'per-sqm'
  RETURNING id INTO cellular_material_option_id;

  -- If no ID returned, fetch it
  IF cellular_material_option_id IS NULL THEN
    SELECT id INTO cellular_material_option_id
    FROM treatment_options
    WHERE treatment_category = 'cellular_shades' 
      AND key = 'cell_material'
      AND template_id IS NULL
    LIMIT 1;
  END IF;

  -- Insert default material values for cellular shades
  INSERT INTO option_values (option_id, code, label, order_index, extra_data)
  VALUES
    (cellular_material_option_id, 'single_cell', 'Single Cell', 1, 
     '{"pricing_method": "per-sqm", "description": "Standard single cell fabric"}'::jsonb),
    (cellular_material_option_id, 'double_cell', 'Double Cell', 2, 
     '{"pricing_method": "per-sqm", "description": "Enhanced insulation double cell"}'::jsonb),
    (cellular_material_option_id, 'blackout_cell', 'Blackout Cell', 3, 
     '{"pricing_method": "per-sqm", "description": "Light blocking cellular fabric"}'::jsonb)
  ON CONFLICT (option_id, code) DO NOTHING;
END $$;

-- Insert material option for Awnings
DO $$
DECLARE
  awning_material_option_id uuid;
BEGIN
  -- Insert or get awning material option
  INSERT INTO treatment_options (
    key, label, input_type, required, visible, order_index,
    treatment_category, is_system_default, tracks_inventory, pricing_method
  )
  VALUES (
    'canvas_material', 'Canvas Material', 'select', true, true, 2,
    'awning', true, true, 'per-sqm'
  )
  ON CONFLICT (treatment_category, key) WHERE template_id IS NULL
  DO UPDATE SET 
    tracks_inventory = true,
    pricing_method = 'per-sqm'
  RETURNING id INTO awning_material_option_id;

  -- If no ID returned, fetch it
  IF awning_material_option_id IS NULL THEN
    SELECT id INTO awning_material_option_id
    FROM treatment_options
    WHERE treatment_category = 'awning' 
      AND key = 'canvas_material'
      AND template_id IS NULL
    LIMIT 1;
  END IF;

  -- Insert default material values for awnings
  INSERT INTO option_values (option_id, code, label, order_index, extra_data)
  VALUES
    (awning_material_option_id, 'acrylic_canvas', 'Acrylic Canvas', 1, 
     '{"pricing_method": "per-sqm", "description": "Durable outdoor acrylic fabric"}'::jsonb),
    (awning_material_option_id, 'polyester_canvas', 'Polyester Canvas', 2, 
     '{"pricing_method": "per-sqm", "description": "Weather resistant polyester"}'::jsonb),
    (awning_material_option_id, 'vinyl_coated', 'Vinyl Coated', 3, 
     '{"pricing_method": "per-sqm", "description": "Heavy duty vinyl coated fabric"}'::jsonb)
  ON CONFLICT (option_id, code) DO NOTHING;
END $$;