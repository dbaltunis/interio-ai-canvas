-- Fix treatment options by using correct template_id column
-- This migration adds comprehensive treatment options for all blind types

DO $$
DECLARE
  roller_template_id uuid;
  roman_template_id uuid;
  venetian_template_id uuid;
  vertical_template_id uuid;
  shutter_template_id uuid;
  cellular_template_id uuid;
  
  -- Option IDs
  tube_size_id uuid;
  mount_type_roller_id uuid;
  fascia_type_id uuid;
  bottom_rail_id uuid;
  control_type_roller_id uuid;
  motor_type_roller_id uuid;
  chain_side_id uuid;
  
  roman_mount_id uuid;
  lining_type_id uuid;
  fold_style_id uuid;
  roman_control_id uuid;
  roman_motor_id uuid;
  
  vertical_vane_id uuid;
  vertical_mount_id uuid;
  stack_direction_id uuid;
  vertical_control_id uuid;
  vertical_motor_id uuid;
  
  louver_size_id uuid;
  shutter_mount_id uuid;
  frame_style_id uuid;
  hinge_color_id uuid;
  tilt_rod_id uuid;
  
  cell_size_id uuid;
  cellular_mount_id uuid;
  opacity_id uuid;
  cellular_control_id uuid;
  cellular_motor_id uuid;
BEGIN
  -- Get system default template IDs
  SELECT id INTO roller_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'roller_blind' LIMIT 1;
  
  SELECT id INTO roman_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'roman_blind' LIMIT 1;
  
  SELECT id INTO venetian_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'venetian_blind' LIMIT 1;
  
  SELECT id INTO vertical_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'vertical_blind' LIMIT 1;
  
  SELECT id INTO shutter_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'plantation_shutter' LIMIT 1;
  
  SELECT id INTO cellular_template_id FROM curtain_templates 
  WHERE is_system_default = true AND curtain_type = 'cellular_shade' LIMIT 1;

  -- ========== ROLLER BLINDS ==========
  IF roller_template_id IS NOT NULL THEN
    -- Tube Size
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'tube_size', 'Tube Size', 'select', true, true, 1)
    RETURNING id INTO tube_size_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (tube_size_id, '25mm', '25mm', 1),
      (tube_size_id, '32mm', '32mm', 2),
      (tube_size_id, '38mm', '38mm', 3),
      (tube_size_id, '45mm', '45mm', 4);
    
    -- Mount Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'mount_type', 'Mount Type', 'select', true, true, 2)
    RETURNING id INTO mount_type_roller_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (mount_type_roller_id, 'face_fix', 'Face Fix', 1),
      (mount_type_roller_id, 'top_fix', 'Top Fix', 2),
      (mount_type_roller_id, 'reveal_fix', 'Reveal Fix', 3);
    
    -- Fascia Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'fascia_type', 'Fascia Type', 'select', false, true, 3)
    RETURNING id INTO fascia_type_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (fascia_type_id, 'none', 'None', 1),
      (fascia_type_id, 'square', 'Square Fascia', 2),
      (fascia_type_id, 'curved', 'Curved Fascia', 3);
    
    -- Bottom Rail
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'bottom_rail', 'Bottom Rail', 'select', true, true, 4)
    RETURNING id INTO bottom_rail_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (bottom_rail_id, 'standard', 'Standard', 1),
      (bottom_rail_id, 'weighted', 'Weighted', 2),
      (bottom_rail_id, 'hemmed', 'Hemmed', 3);
    
    -- Control Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'control_type', 'Control Type', 'select', true, true, 5)
    RETURNING id INTO control_type_roller_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (control_type_roller_id, 'chain', 'Chain Control', 1),
      (control_type_roller_id, 'spring', 'Spring Roller', 2),
      (control_type_roller_id, 'motorized', 'Motorized', 3);
    
    -- Chain Side
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'chain_side', 'Chain Side', 'select', false, true, 6)
    RETURNING id INTO chain_side_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (chain_side_id, 'left', 'Left', 1),
      (chain_side_id, 'right', 'Right', 2);
    
    -- Motor Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roller_template_id, 'motor_type', 'Motor Type', 'select', false, true, 7)
    RETURNING id INTO motor_type_roller_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (motor_type_roller_id, 'battery', 'Battery Operated', 1),
      (motor_type_roller_id, 'hardwired', 'Hardwired', 2),
      (motor_type_roller_id, 'rechargeable', 'Rechargeable', 3);
  END IF;

  -- ========== ROMAN BLINDS ==========
  IF roman_template_id IS NOT NULL THEN
    -- Mount Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roman_template_id, 'mount_type', 'Mount Type', 'select', true, true, 1)
    RETURNING id INTO roman_mount_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (roman_mount_id, 'face_fix', 'Face Fix', 1),
      (roman_mount_id, 'top_fix', 'Top Fix', 2),
      (roman_mount_id, 'reveal_fix', 'Reveal Fix', 3);
    
    -- Lining Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roman_template_id, 'lining_type', 'Lining Type', 'select', true, true, 2)
    RETURNING id INTO lining_type_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (lining_type_id, 'unlined', 'Unlined', 1),
      (lining_type_id, 'standard', 'Standard Lining', 2),
      (lining_type_id, 'blockout', 'Blockout Lining', 3);
    
    -- Fold Style
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roman_template_id, 'fold_style', 'Fold Style', 'select', true, true, 3)
    RETURNING id INTO fold_style_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (fold_style_id, 'flat', 'Flat Fold', 1),
      (fold_style_id, 'cascade', 'Cascade', 2),
      (fold_style_id, 'hobbled', 'Hobbled', 3);
    
    -- Control Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roman_template_id, 'control_type', 'Control Type', 'select', true, true, 4)
    RETURNING id INTO roman_control_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (roman_control_id, 'chain', 'Chain Control', 1),
      (roman_control_id, 'cord', 'Cord Control', 2),
      (roman_control_id, 'motorized', 'Motorized', 3);
    
    -- Motor Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (roman_template_id, 'motor_type', 'Motor Type', 'select', false, true, 5)
    RETURNING id INTO roman_motor_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (roman_motor_id, 'battery', 'Battery Operated', 1),
      (roman_motor_id, 'hardwired', 'Hardwired', 2),
      (roman_motor_id, 'rechargeable', 'Rechargeable', 3);
  END IF;

  -- ========== VERTICAL BLINDS ==========
  IF vertical_template_id IS NOT NULL THEN
    -- Vane Width
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (vertical_template_id, 'vane_width', 'Vane Width', 'select', true, true, 1)
    RETURNING id INTO vertical_vane_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (vertical_vane_id, '89mm', '89mm (3.5")', 1),
      (vertical_vane_id, '127mm', '127mm (5")', 2);
    
    -- Mount Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (vertical_template_id, 'mount_type', 'Mount Type', 'select', true, true, 2)
    RETURNING id INTO vertical_mount_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (vertical_mount_id, 'face_fix', 'Face Fix', 1),
      (vertical_mount_id, 'top_fix', 'Top Fix', 2);
    
    -- Stack Direction
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (vertical_template_id, 'stack_direction', 'Stack Direction', 'select', true, true, 3)
    RETURNING id INTO stack_direction_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (stack_direction_id, 'left', 'Stack Left', 1),
      (stack_direction_id, 'right', 'Stack Right', 2),
      (stack_direction_id, 'center', 'Split Stack', 3);
    
    -- Control Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (vertical_template_id, 'control_type', 'Control Type', 'select', true, true, 4)
    RETURNING id INTO vertical_control_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (vertical_control_id, 'wand', 'Wand Control', 1),
      (vertical_control_id, 'chain', 'Chain Control', 2),
      (vertical_control_id, 'motorized', 'Motorized', 3);
    
    -- Motor Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (vertical_template_id, 'motor_type', 'Motor Type', 'select', false, true, 5)
    RETURNING id INTO vertical_motor_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (vertical_motor_id, 'battery', 'Battery Operated', 1),
      (vertical_motor_id, 'hardwired', 'Hardwired', 2);
  END IF;

  -- ========== PLANTATION SHUTTERS ==========
  IF shutter_template_id IS NOT NULL THEN
    -- Louver Size
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (shutter_template_id, 'louver_size', 'Louver Size', 'select', true, true, 1)
    RETURNING id INTO louver_size_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (louver_size_id, '63mm', '63mm (2.5")', 1),
      (louver_size_id, '89mm', '89mm (3.5")', 2),
      (louver_size_id, '114mm', '114mm (4.5")', 3);
    
    -- Mount Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (shutter_template_id, 'mount_type', 'Mount Type', 'select', true, true, 2)
    RETURNING id INTO shutter_mount_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (shutter_mount_id, 'inside', 'Inside Mount', 1),
      (shutter_mount_id, 'outside', 'Outside Mount', 2);
    
    -- Frame Style
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (shutter_template_id, 'frame_style', 'Frame Style', 'select', true, true, 3)
    RETURNING id INTO frame_style_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (frame_style_id, 'l_frame', 'L-Frame', 1),
      (frame_style_id, 'z_frame', 'Z-Frame', 2),
      (frame_style_id, 'deco', 'Deco Frame', 3);
    
    -- Hinge Color
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (shutter_template_id, 'hinge_color', 'Hinge Color', 'select', true, true, 4)
    RETURNING id INTO hinge_color_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (hinge_color_id, 'white', 'White', 1),
      (hinge_color_id, 'stainless', 'Stainless Steel', 2),
      (hinge_color_id, 'black', 'Black', 3);
    
    -- Tilt Rod
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (shutter_template_id, 'tilt_rod', 'Tilt Rod', 'select', true, true, 5)
    RETURNING id INTO tilt_rod_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (tilt_rod_id, 'center', 'Center Tilt Rod', 1),
      (tilt_rod_id, 'offset', 'Offset Tilt Rod', 2),
      (tilt_rod_id, 'hidden', 'Hidden Tilt Rod', 3);
  END IF;

  -- ========== CELLULAR SHADES ==========
  IF cellular_template_id IS NOT NULL THEN
    -- Cell Size
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (cellular_template_id, 'cell_size', 'Cell Size', 'select', true, true, 1)
    RETURNING id INTO cell_size_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (cell_size_id, 'single_9mm', 'Single Cell 9mm', 1),
      (cell_size_id, 'single_13mm', 'Single Cell 13mm', 2),
      (cell_size_id, 'double_13mm', 'Double Cell 13mm', 3);
    
    -- Mount Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (cellular_template_id, 'mount_type', 'Mount Type', 'select', true, true, 2)
    RETURNING id INTO cellular_mount_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (cellular_mount_id, 'inside', 'Inside Mount', 1),
      (cellular_mount_id, 'outside', 'Outside Mount', 2);
    
    -- Opacity
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (cellular_template_id, 'opacity', 'Opacity', 'select', true, true, 3)
    RETURNING id INTO opacity_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (opacity_id, 'sheer', 'Sheer', 1),
      (opacity_id, 'light_filtering', 'Light Filtering', 2),
      (opacity_id, 'blackout', 'Blackout', 3);
    
    -- Control Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (cellular_template_id, 'control_type', 'Control Type', 'select', true, true, 4)
    RETURNING id INTO cellular_control_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (cellular_control_id, 'cordless', 'Cordless', 1),
      (cellular_control_id, 'continuous_cord', 'Continuous Cord Loop', 2),
      (cellular_control_id, 'motorized', 'Motorized', 3);
    
    -- Motor Type
    INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
    VALUES (cellular_template_id, 'motor_type', 'Motor Type', 'select', false, true, 5)
    RETURNING id INTO cellular_motor_id;
    
    INSERT INTO option_values (option_id, code, label, order_index) VALUES
      (cellular_motor_id, 'battery', 'Battery Operated', 1),
      (cellular_motor_id, 'rechargeable', 'Rechargeable', 2),
      (cellular_motor_id, 'hardwired', 'Hardwired', 3);
  END IF;

  RAISE NOTICE 'Successfully added all treatment options with correct template_id';
END $$;