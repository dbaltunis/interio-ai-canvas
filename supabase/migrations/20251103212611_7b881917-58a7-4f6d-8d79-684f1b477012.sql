-- Populate treatment options with common curtain options and values
-- This fixes the critical issue where treatment options had no values

-- First, let's add more common curtain options
INSERT INTO treatment_options (key, label, input_type, treatment_category, required, visible, order_index)
VALUES 
  ('control_type', 'Control Type', 'select', 'curtains', true, true, 1),
  ('chain_side', 'Chain Side', 'select', 'curtains', false, true, 2),
  ('mounting_type', 'Mounting Type', 'select', 'curtains', false, true, 3)
ON CONFLICT (key, treatment_category) DO NOTHING;

-- Get the option IDs for the existing and new options
DO $$
DECLARE
  v_motor_type_id UUID;
  v_bracket_type_id UUID;
  v_control_type_id UUID;
  v_chain_side_id UUID;
  v_mounting_type_id UUID;
BEGIN
  -- Get existing option IDs
  SELECT id INTO v_motor_type_id FROM treatment_options WHERE key = 'motor_type' AND treatment_category = 'curtains';
  SELECT id INTO v_bracket_type_id FROM treatment_options WHERE key = 'bracket_type' AND treatment_category = 'curtains';
  SELECT id INTO v_control_type_id FROM treatment_options WHERE key = 'control_type' AND treatment_category = 'curtains';
  SELECT id INTO v_chain_side_id FROM treatment_options WHERE key = 'chain_side' AND treatment_category = 'curtains';
  SELECT id INTO v_mounting_type_id FROM treatment_options WHERE key = 'mounting_type' AND treatment_category = 'curtains';

  -- Add option values for Motor Type
  IF v_motor_type_id IS NOT NULL THEN
    INSERT INTO option_values (option_id, code, label, order_index, extra_data)
    VALUES 
      (v_motor_type_id, 'none', 'No Motor (Manual)', 1, '{"price": 0, "description": "Manual operation", "pricing_method": "per-unit"}'::jsonb),
      (v_motor_type_id, 'standard_motor', 'Standard Motor', 2, '{"price": 250, "description": "Electric motor with remote control", "pricing_method": "per-unit"}'::jsonb),
      (v_motor_type_id, 'smart_motor', 'Smart Motor', 3, '{"price": 450, "description": "WiFi-enabled motor with app control", "pricing_method": "per-unit"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add option values for Bracket Type
  IF v_bracket_type_id IS NOT NULL THEN
    INSERT INTO option_values (option_id, code, label, order_index, extra_data)
    VALUES 
      (v_bracket_type_id, 'standard', 'Standard Bracket', 1, '{"price": 15, "description": "Standard metal bracket", "pricing_method": "per-unit"}'::jsonb),
      (v_bracket_type_id, 'decorative', 'Decorative Bracket', 2, '{"price": 35, "description": "Ornate decorative bracket", "pricing_method": "per-unit"}'::jsonb),
      (v_bracket_type_id, 'ceiling_fix', 'Ceiling Fix Bracket', 3, '{"price": 25, "description": "Ceiling mounted bracket", "pricing_method": "per-unit"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add option values for Control Type
  IF v_control_type_id IS NOT NULL THEN
    INSERT INTO option_values (option_id, code, label, order_index, extra_data)
    VALUES 
      (v_control_type_id, 'cord', 'Cord Control', 1, '{"price": 0, "description": "Traditional cord control", "pricing_method": "per-unit"}'::jsonb),
      (v_control_type_id, 'chain', 'Chain Control', 2, '{"price": 10, "description": "Chain control mechanism", "pricing_method": "per-unit"}'::jsonb),
      (v_control_type_id, 'wand', 'Wand Control', 3, '{"price": 15, "description": "Wand control mechanism", "pricing_method": "per-unit"}'::jsonb),
      (v_control_type_id, 'motorized', 'Motorized Control', 4, '{"price": 200, "description": "Electric motorized control", "pricing_method": "per-unit"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add option values for Chain Side
  IF v_chain_side_id IS NOT NULL THEN
    INSERT INTO option_values (option_id, code, label, order_index, extra_data)
    VALUES 
      (v_chain_side_id, 'left', 'Left Side', 1, '{"price": 0, "description": "Chain on left side", "pricing_method": "per-unit"}'::jsonb),
      (v_chain_side_id, 'right', 'Right Side', 2, '{"price": 0, "description": "Chain on right side", "pricing_method": "per-unit"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add option values for Mounting Type
  IF v_mounting_type_id IS NOT NULL THEN
    INSERT INTO option_values (option_id, code, label, order_index, extra_data)
    VALUES 
      (v_mounting_type_id, 'wall', 'Wall Mount', 1, '{"price": 0, "description": "Mount on wall", "pricing_method": "per-unit"}'::jsonb),
      (v_mounting_type_id, 'ceiling', 'Ceiling Mount', 2, '{"price": 10, "description": "Mount on ceiling", "pricing_method": "per-unit"}'::jsonb),
      (v_mounting_type_id, 'recess', 'Recess Mount', 3, '{"price": 15, "description": "Mount in window recess", "pricing_method": "per-unit"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;