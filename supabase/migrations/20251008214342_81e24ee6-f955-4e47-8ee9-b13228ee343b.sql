-- Fix security warning: set search_path for the function
DROP FUNCTION IF EXISTS create_system_blind_templates();

CREATE OR REPLACE FUNCTION create_system_blind_templates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  system_user_id uuid;
BEGIN
  SELECT id INTO system_user_id FROM auth.users LIMIT 1;
  
  IF system_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found to assign system templates';
  END IF;

  INSERT INTO curtain_templates (
    name, description, treatment_category, curtain_type, 
    is_system_default, user_id, active,
    pricing_type, unit_price, manufacturing_type,
    fabric_width_type, fabric_direction, fullness_ratio,
    heading_name
  ) VALUES 
    ('Roller Blind - Standard', 'Standard roller blind with light filtering fabric', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 45.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roller Blind - Blockout', 'Complete light blocking roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 55.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roller Blind - Sunscreen', 'UV protective sunscreen roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true, 'per_metre', 50.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Roman Blind - Flat', 'Classic flat fold roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 85.00, 'machine', 'wide', 'standard', 1.0, 'Flat'),
    ('Roman Blind - Cascade', 'Elegant cascade style roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 95.00, 'hand', 'wide', 'standard', 1.0, 'Cascade'),
    ('Roman Blind - Hobbled', 'Luxurious hobbled roman blind with permanent folds', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true, 'per_metre', 105.00, 'hand', 'wide', 'standard', 1.0, 'Hobbled'),
    ('Venetian Blind - Aluminum', 'Durable aluminum slat venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 40.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Venetian Blind - Wood', 'Premium timber venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 75.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Venetian Blind - Faux Wood', 'Moisture-resistant faux wood venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true, 'per_metre', 55.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Vertical Blind - Fabric', 'Fabric vane vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true, 'per_metre', 50.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Vertical Blind - PVC', 'Durable PVC vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true, 'per_metre', 45.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Panel Glide', 'Modern panel track system', 'panel_glide', 'panel_glide', 
     true, system_user_id, true, 'per_metre', 65.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Plantation Shutter - Basswood', 'Premium basswood plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 450.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Plantation Shutter - PVC', 'Moisture-resistant PVC plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 350.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Plantation Shutter - Aluminum', 'Durable aluminum plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true, 'per_metre', 400.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Cellular Shade - Single Cell', 'Energy efficient single cell honeycomb shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 60.00, 'machine', 'wide', 'standard', 1.0, 'Standard'),
    ('Cellular Shade - Double Cell', 'Premium double cell honeycomb shade for maximum insulation', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true, 'per_metre', 75.00, 'machine', 'wide', 'standard', 1.0, 'Standard')
  ON CONFLICT DO NOTHING;
END;
$$;