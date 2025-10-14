-- Add comprehensive blind and shutter templates
-- Using only existing valid treatment_category values

CREATE OR REPLACE FUNCTION public.create_comprehensive_blind_templates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  system_user_id uuid;
BEGIN
  SELECT id INTO system_user_id FROM auth.users LIMIT 1;
  
  IF system_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found';
  END IF;

  INSERT INTO curtain_templates (
    name, description, treatment_category, curtain_type, 
    is_system_default, user_id, active,
    pricing_type, unit_price, manufacturing_type,
    fabric_width_type, fabric_direction, fullness_ratio,
    heading_name
  ) VALUES 
    -- ROLLER BLINDS (includes External Screens & Insect Screens)
    ('Roller Blind - Standard', 'Light filtering roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 45.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roller Blind - Blockout', 'Complete blockout roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 55.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roller Blind - Sunscreen', 'UV sunscreen roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 50.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roller Blind - Dual', 'Dual blockout and sunscreen', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 85.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('External Screen - Standard', 'Weather resistant external screen', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 95.00, 'machine', 'wide', 'standard', 1.0, 'External'),
    ('External Screen - Motorized', 'Motorized external screen', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 150.00, 'machine', 'wide', 'standard', 1.0, 'External'),
    ('External Screen - Zip Track', 'Zip track external screen', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 180.00, 'machine', 'wide', 'standard', 1.0, 'External'),
    ('Insect Screen - Fiberglass', 'Fiberglass insect mesh', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 35.00, 'machine', 'wide', 'standard', 1.0, 'Insect'),
    ('Insect Screen - Pet Resistant', 'Pet resistant mesh', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 45.00, 'machine', 'wide', 'standard', 1.0, 'Insect'),
    ('Insect Screen - Retractable', 'Retractable insect screen', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 65.00, 'machine', 'wide', 'standard', 1.0, 'Insect'),
    
    -- ROMAN BLINDS
    ('Roman Blind - Flat', 'Flat fold roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 85.00, 'machine', 'wide', 'standard', 1.0, 'Flat'),
    ('Roman Blind - Cascade', 'Cascade roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 95.00, 'hand', 'wide', 'standard', 1.0, 'Cascade'),
    ('Roman Blind - Hobbled', 'Hobbled roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 105.00, 'hand', 'wide', 'standard', 1.0, 'Hobbled'),
    
    -- VENETIAN BLINDS
    ('Venetian - Aluminum 25mm', 'Aluminum venetian', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 40.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Venetian - Wood 50mm', 'Timber venetian', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 75.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Venetian - Faux Wood', 'Faux wood venetian', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 55.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    
    -- VERTICAL BLINDS
    ('Vertical - Fabric', 'Fabric vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true, 'per_metre', 50.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Vertical - PVC', 'PVC vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true, 'per_metre', 45.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    
    -- PANEL GLIDES
    ('Panel Glide - Standard', 'Panel track 2 panels', 'panel_glide', 'panel_glide', 
     true, system_user_id, true, 'per_metre', 65.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Panel Glide - Blockout', 'Panel glide blockout', 'panel_glide', 'panel_glide', 
     true, system_user_id, true, 'per_metre', 75.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Panel Glide - Sheer', 'Panel glide sheer', 'panel_glide', 'panel_glide', 
     true, system_user_id, true, 'per_metre', 70.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    
    -- SHUTTERS (expanded with more options)
    ('Plantation - Basswood', 'Basswood plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 450.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Plantation - PVC', 'PVC plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 350.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Plantation - Aluminum', 'Aluminum plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 400.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Shutter - Solid Panel', 'Solid panel shutters', 'shutters', 'shutter', 
     true, system_user_id, true, 'per_metre', 280.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    
    -- CELLULAR/HONEYCOMB SHADES
    ('Honeycomb - Single Cell', 'Single cell shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 60.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Honeycomb - Double Cell', 'Double cell shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 75.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Honeycomb - Top-Down Bottom-Up', 'TDBU cellular shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 85.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Honeycomb - Motorized', 'Motorized cellular shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 110.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    
    -- AWNINGS (using curtains category as placeholder until awning category is added)
    ('Folding Arm Awning', 'Retractable folding arm', 'curtains', 'curtain', 
     true, system_user_id, true, 'per_metre', 250.00, 'machine', 'wide', 'standard', 1.0, 'Awning'),
    ('Fixed Awning', 'Fixed frame awning', 'curtains', 'curtain', 
     true, system_user_id, true, 'per_metre', 180.00, 'machine', 'wide', 'standard', 1.0, 'Awning'),
    ('Motorized Awning', 'Electric motorized awning', 'curtains', 'curtain', 
     true, system_user_id, true, 'per_metre', 320.00, 'machine', 'wide', 'standard', 1.0, 'Awning')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Templates created successfully';
END;
$function$;

SELECT public.create_comprehensive_blind_templates();

-- Add options for new categories
INSERT INTO treatment_options (treatment_category, key, label, input_type, is_system_default, required, visible, order_index)
VALUES 
  ('panel_glide', 'panel_count', 'Number of Panels', 'select', true, true, true, 1),
  ('panel_glide', 'track_type', 'Track Type', 'select', true, true, true, 2),
  ('panel_glide', 'control_type', 'Control Type', 'select', true, true, true, 3),
  ('cellular_shades', 'cell_type', 'Cell Type', 'select', true, true, true, 1),
  ('cellular_shades', 'opacity', 'Light Filtering', 'select', true, true, true, 2),
  ('cellular_shades', 'control', 'Control Type', 'select', true, true, true, 3)
ON CONFLICT DO NOTHING;