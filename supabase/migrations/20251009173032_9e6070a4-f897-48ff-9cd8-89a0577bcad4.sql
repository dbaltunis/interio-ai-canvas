-- Add complete treatment options for all system default templates with correct keys

-- ROLLER BLINDS OPTIONS
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  -- For each Roller Blind template
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Roller Blind%' AND is_system_default = true
  LOOP
    -- Tube Sizes
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'tube_size', 'Tube Size', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, '28mm', '28mm Tube', 1),
        (v_option_id, '32mm', '32mm Tube', 2),
        (v_option_id, '38mm', '38mm Tube', 3),
        (v_option_id, '45mm', '45mm Tube', 4)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Mount Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'mount_type', 'Mount Type', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'inside_mount', 'Inside Mount', 1),
        (v_option_id, 'outside_mount', 'Outside Mount', 2),
        (v_option_id, 'ceiling_mount', 'Ceiling Mount', 3)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Fascia Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'fascia_type', 'Fascia Type', 'select', false, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'none', 'No Fascia', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'standard_fascia', 'Standard Fascia', 2, '{"price_modifier": 15}'::jsonb),
        (v_option_id, 'designer_fascia', 'Designer Fascia', 3, '{"price_modifier": 35}'::jsonb),
        (v_option_id, 'curved_fascia', 'Curved Fascia', 4, '{"price_modifier": 45}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Bottom Rails
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'bottom_rail_style', 'Bottom Rail Style', 'select', true, true, 4)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'weighted', 'Weighted Bar', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'decorative_bar', 'Decorative Bar', 2, '{"price_modifier": 12}'::jsonb),
        (v_option_id, 'slimline', 'Slimline Bar', 3, '{"price_modifier": 8}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 5)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'chain', 'Chain Control', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'spring', 'Spring Assist', 2, '{"price_modifier": 25}'::jsonb),
        (v_option_id, 'crank', 'Crank Control', 3, '{"price_modifier": 35}'::jsonb),
        (v_option_id, 'motorized', 'Motorized', 4, '{"price_modifier": 180}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Motor Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'motor_type', 'Motor Type', 'select', false, true, 6)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'battery', 'Battery Motor', 1, '{"price_modifier": 150}'::jsonb),
        (v_option_id, 'hardwired', 'Hardwired Motor', 2, '{"price_modifier": 200}'::jsonb),
        (v_option_id, 'somfy_rts', 'Somfy RTS', 3, '{"price_modifier": 250}'::jsonb),
        (v_option_id, 'smart_home', 'Smart Home Compatible', 4, '{"price_modifier": 300}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ROMAN BLINDS OPTIONS
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Roman Blind%' AND is_system_default = true
  LOOP
    -- Lining Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'lining_type', 'Lining Type', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'standard', 'Standard Lining', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'blackout', 'Blackout Lining', 2, '{"price_modifier": 15}'::jsonb),
        (v_option_id, 'thermal', 'Thermal Lining', 3, '{"price_modifier": 20}'::jsonb),
        (v_option_id, 'interlining', 'Interlining', 4, '{"price_modifier": 25}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'cord', 'Cord Control', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'cordless', 'Cordless', 2, '{"price_modifier": 30}'::jsonb),
        (v_option_id, 'motorized', 'Motorized', 3, '{"price_modifier": 200}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Mount Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'mount_type', 'Mount Type', 'select', true, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'inside_mount', 'Inside Mount', 1),
        (v_option_id, 'outside_mount', 'Outside Mount', 2)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- VENETIAN BLINDS OPTIONS  
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Venetian Blind%' AND is_system_default = true
  LOOP
    -- Slat Sizes
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'slat_size', 'Slat Size', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, '16mm', '16mm (5/8")', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, '25mm', '25mm (1")', 2, '{"price_modifier": 5}'::jsonb),
        (v_option_id, '50mm', '50mm (2")', 3, '{"price_modifier": 12}'::jsonb),
        (v_option_id, '63mm', '63mm (2.5")', 4, '{"price_modifier": 18}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'wand', 'Wand Control', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'cord_tilt', 'Cord Tilt', 2, '{"price_modifier": 5}'::jsonb),
        (v_option_id, 'motorized', 'Motorized', 3, '{"price_modifier": 180}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Mount Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'mount_type', 'Mount Type', 'select', true, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'inside_mount', 'Inside Mount', 1),
        (v_option_id, 'outside_mount', 'Outside Mount', 2)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- VERTICAL BLINDS OPTIONS
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Vertical Blind%' AND is_system_default = true
  LOOP
    -- Vane Widths
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'vane_width', 'Vane Width', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, '89mm', '89mm (3.5")', 1),
        (v_option_id, '127mm', '127mm (5")', 2)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'wand', 'Wand Control', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'cord', 'Cord Control', 2, '{"price_modifier": 5}'::jsonb),
        (v_option_id, 'motorized', 'Motorized', 3, '{"price_modifier": 200}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Stack Direction
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'stack_direction', 'Stack Direction', 'select', true, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'left', 'Stack Left', 1),
        (v_option_id, 'right', 'Stack Right', 2),
        (v_option_id, 'center', 'Center Split', 3)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Mount Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'mount_type', 'Mount Type', 'select', true, true, 4)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'inside_mount', 'Inside Mount', 1),
        (v_option_id, 'outside_mount', 'Outside Mount', 2),
        (v_option_id, 'ceiling_mount', 'Ceiling Mount', 3)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- PLANTATION SHUTTERS OPTIONS
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Plantation Shutter%' AND is_system_default = true
  LOOP
    -- Louver Sizes
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'louver_size', 'Louver Size', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, '63mm', '63mm (2.5")', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, '89mm', '89mm (3.5")', 2, '{"price_modifier": 30}'::jsonb),
        (v_option_id, '114mm', '114mm (4.5")', 3, '{"price_modifier": 60}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Frame Styles
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'frame_style', 'Frame Style', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'standard', 'Standard Frame', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'z_frame', 'Z-Frame', 2, '{"price_modifier": 40}'::jsonb),
        (v_option_id, 'l_frame', 'L-Frame', 3, '{"price_modifier": 35}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'center_tilt', 'Center Tilt Rod', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'offset_tilt', 'Offset Tilt Rod', 2, '{"price_modifier": 10}'::jsonb),
        (v_option_id, 'hidden_tilt', 'Hidden Tilt (Clearview)', 3, '{"price_modifier": 50}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Mount Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'mount_type', 'Mount Type', 'select', true, true, 4)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, 'inside_mount', 'Inside Mount', 1),
        (v_option_id, 'outside_mount', 'Outside Mount', 2)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- CELLULAR SHADES OPTIONS
DO $$
DECLARE
  v_template_id uuid;
  v_option_id uuid;
BEGIN
  FOR v_template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Cellular Shade%' AND is_system_default = true
  LOOP
    -- Cell Sizes
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'cell_size', 'Cell Size', 'select', true, true, 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index)
      VALUES 
        (v_option_id, '9mm', '9mm (3/8")', 1),
        (v_option_id, '13mm', '13mm (1/2")', 2),
        (v_option_id, '19mm', '19mm (3/4")', 3)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Control Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'cordlock', 'Cord Lock', 1, '{"price_modifier": 0}'::jsonb),
        (v_option_id, 'cordless', 'Cordless', 2, '{"price_modifier": 25}'::jsonb),
        (v_option_id, 'remote', 'Remote Control', 3, '{"price_modifier": 180}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Motor Types
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (v_template_id, 'motor_type', 'Motor Type', 'select', false, true, 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_option_id;
    
    IF v_option_id IS NOT NULL THEN
      INSERT INTO option_values (option_id, code, label, order_index, extra_data)
      VALUES 
        (v_option_id, 'battery', 'Battery Powered', 1, '{"price_modifier": 150}'::jsonb),
        (v_option_id, 'somfy_rts', 'Somfy RTS', 2, '{"price_modifier": 220}'::jsonb),
        (v_option_id, 'smart_home', 'Smart Home Compatible', 3, '{"price_modifier": 280}'::jsonb)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;