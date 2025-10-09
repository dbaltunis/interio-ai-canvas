-- Seed preset options for system default blind templates (without rules for now)

-- ROLLER BLINDS: Standard, Blockout, Sunscreen
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Roller Blind%' AND is_system_default = true
  LOOP
    -- Fabric Type
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'fabric_type', 'Fabric Type', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'sunscreen_3', 'Sunscreen 3%', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'sunscreen_5', 'Sunscreen 5%', '{"price_modifier": 0}'::jsonb, 2),
      (option_id, 'light_filtering', 'Light Filtering', '{"price_modifier": 5}'::jsonb, 3),
      (option_id, 'blockout', 'Blockout', '{"price_modifier": 10}'::jsonb, 4);

    -- Tube Size
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'tube_size', 'Tube Size', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '38mm', '38mm', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '45mm', '45mm', '{"price_modifier": 5}'::jsonb, 2),
      (option_id, '60mm', '60mm', '{"price_modifier": 15}'::jsonb, 3),
      (option_id, '70mm', '70mm', '{"price_modifier": 25}'::jsonb, 4);

    -- Control Type
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'control_type', 'Control Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'chain', 'Chain', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'spring', 'Spring', '{"price_modifier": 10}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 200}'::jsonb, 3);

    -- Motor Type (hidden by default, shown conditionally)
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'motor_type', 'Motor Type', 'select', false, false, 4)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'battery', 'Battery Powered', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'hardwired', 'Hardwired', '{"price_modifier": 50}'::jsonb, 2),
      (option_id, 'rechargeable', 'Rechargeable', '{"price_modifier": 30}'::jsonb, 3);

    -- Mount Type
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'mount_type', 'Mount Type', 'select', true, true, 5)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'inside', 'Inside Mount', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'outside', 'Outside Mount', '{"price_modifier": 0}'::jsonb, 2);
  END LOOP;
END $$;

-- VENETIAN BLINDS: Aluminum, Wood, Faux Wood
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Venetian Blind%' AND is_system_default = true
  LOOP
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'slat_size', 'Slat Size', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '25mm', '25mm', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '50mm', '50mm', '{"price_modifier": 10}'::jsonb, 2),
      (option_id, '63mm', '63mm', '{"price_modifier": 15}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'wand', 'Wand', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'cord', 'Cord', '{"price_modifier": 0}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 250}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'mount_type', 'Mount Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'inside', 'Inside Mount', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'outside', 'Outside Mount', '{"price_modifier": 0}'::jsonb, 2);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'finish', 'Finish', 'select', true, true, 4)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'white', 'White', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'natural', 'Natural', '{"price_modifier": 5}'::jsonb, 2),
      (option_id, 'stained', 'Stained', '{"price_modifier": 15}'::jsonb, 3),
      (option_id, 'custom', 'Custom Color', '{"price_modifier": 25}'::jsonb, 4);
  END LOOP;
END $$;

-- ROMAN BLINDS: Flat, Cascade, Hobbled
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Roman Blind%' AND is_system_default = true
  LOOP
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'lining_type', 'Lining Type', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'unlined', 'Unlined', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'standard', 'Standard Lining', '{"price_modifier": 20}'::jsonb, 2),
      (option_id, 'blockout', 'Blockout Lining', '{"price_modifier": 35}'::jsonb, 3),
      (option_id, 'thermal', 'Thermal Lining', '{"price_modifier": 40}'::jsonb, 4);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'lift_system', 'Lift System', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'cord', 'Cord', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'chain', 'Chain', '{"price_modifier": 10}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 300}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'mount_type', 'Mount Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'inside', 'Inside Mount', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'outside', 'Outside Mount', '{"price_modifier": 0}'::jsonb, 2);
  END LOOP;
END $$;

-- VERTICAL BLINDS: Fabric, PVC
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Vertical Blind%' AND is_system_default = true
  LOOP
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'slat_width', 'Slat Width', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '89mm', '89mm', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '127mm', '127mm', '{"price_modifier": 15}'::jsonb, 2);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'wand', 'Wand', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'chain', 'Chain', '{"price_modifier": 5}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 280}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'mount_type', 'Mount Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'inside', 'Inside Mount', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'outside', 'Outside Mount', '{"price_modifier": 0}'::jsonb, 2);
  END LOOP;
END $$;

-- PLANTATION SHUTTERS: Basswood, PVC, Aluminum
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Plantation Shutter%' AND is_system_default = true
  LOOP
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'blade_size', 'Blade Size', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '63mm', '63mm', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '89mm', '89mm', '{"price_modifier": 50}'::jsonb, 2),
      (option_id, '114mm', '114mm', '{"price_modifier": 80}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'frame_type', 'Frame Type', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'l_frame', 'L-Frame', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'z_frame', 'Z-Frame', '{"price_modifier": 30}'::jsonb, 2),
      (option_id, 'no_frame', 'Frameless', '{"price_modifier": 20}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'finish', 'Finish', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'painted_white', 'Painted White', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'stained', 'Stained', '{"price_modifier": 60}'::jsonb, 2),
      (option_id, 'natural', 'Natural', '{"price_modifier": 40}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'tilt_rod', 'Tilt Rod', 'select', true, true, 4)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'front', 'Front Tilt Rod', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'hidden', 'Hidden Tilt', '{"price_modifier": 45}'::jsonb, 2),
      (option_id, 'split', 'Split Tilt', '{"price_modifier": 35}'::jsonb, 3);
  END LOOP;
END $$;

-- CELLULAR SHADES: Single Cell, Double Cell
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  FOR template_id IN 
    SELECT id FROM curtain_templates 
    WHERE name LIKE 'Cellular Shade%' AND is_system_default = true
  LOOP
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'cell_size', 'Cell Size', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '10mm', '10mm', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '20mm', '20mm', '{"price_modifier": 8}'::jsonb, 2),
      (option_id, '25mm', '25mm', '{"price_modifier": 12}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'opacity', 'Opacity', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'sheer', 'Sheer', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'light_filtering', 'Light Filtering', '{"price_modifier": 10}'::jsonb, 2),
      (option_id, 'blockout', 'Blockout', '{"price_modifier": 20}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'control_type', 'Control Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'cord', 'Cord', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'cordless', 'Cordless', '{"price_modifier": 25}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 220}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'mount_type', 'Mount Type', 'select', true, true, 4)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'inside', 'Inside Mount', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'outside', 'Outside Mount', '{"price_modifier": 0}'::jsonb, 2);
  END LOOP;
END $$;

-- PANEL GLIDE
DO $$
DECLARE
  template_id uuid;
  option_id uuid;
BEGIN
  SELECT id INTO template_id FROM curtain_templates 
  WHERE name = 'Panel Glide' AND is_system_default = true 
  LIMIT 1;
  
  IF template_id IS NOT NULL THEN
    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'track_type', 'Track Type', 'select', true, true, 1)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, '2_track', '2 Track', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, '3_track', '3 Track', '{"price_modifier": 40}'::jsonb, 2),
      (option_id, '4_track', '4 Track', '{"price_modifier": 70}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'control_type', 'Control Type', 'select', true, true, 2)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'wand', 'Wand', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'cord', 'Cord', '{"price_modifier": 10}'::jsonb, 2),
      (option_id, 'motorized', 'Motorized', '{"price_modifier": 350}'::jsonb, 3);

    INSERT INTO treatment_options (treatment_id, key, label, input_type, required, visible, order_index)
    VALUES (template_id, 'fabric_type', 'Fabric Type', 'select', true, true, 3)
    RETURNING id INTO option_id;
    
    INSERT INTO option_values (option_id, code, label, extra_data, order_index)
    VALUES 
      (option_id, 'sheer', 'Sheer', '{"price_modifier": 0}'::jsonb, 1),
      (option_id, 'semi_transparent', 'Semi-Transparent', '{"price_modifier": 15}'::jsonb, 2),
      (option_id, 'blockout', 'Blockout', '{"price_modifier": 30}'::jsonb, 3);
  END IF;
END $$;