-- Drop the old check constraint
ALTER TABLE curtain_templates DROP CONSTRAINT IF EXISTS check_treatment_category;

-- Add updated constraint with all blind and shutter types
ALTER TABLE curtain_templates 
ADD CONSTRAINT check_treatment_category 
CHECK (treatment_category = ANY (ARRAY[
  'curtains'::text, 
  'roller_blinds'::text, 
  'roman_blinds'::text, 
  'venetian_blinds'::text,
  'vertical_blinds'::text,
  'panel_glide'::text,
  'cellular_shades'::text,
  'shutters'::text
]));

-- Add system default flag column
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS is_system_default BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_curtain_templates_system_default 
ON curtain_templates(is_system_default) WHERE is_system_default = true;

-- Function to create system blind templates
CREATE OR REPLACE FUNCTION create_system_blind_templates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Get first user to assign as system template owner
  SELECT id INTO system_user_id FROM auth.users LIMIT 1;
  
  IF system_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found to assign system templates';
  END IF;

  -- Insert system default blind and shutter templates with all required fields
  INSERT INTO curtain_templates (
    name, description, treatment_category, curtain_type, 
    is_system_default, user_id, active,
    pricing_type, unit_price, manufacturing_type,
    fabric_width_type, fabric_direction, fullness_ratio,
    heading_name
  ) VALUES 
    -- Roller Blinds
    ('Roller Blind - Standard', 'Standard roller blind with light filtering fabric', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true,
     'per_metre', 45.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Roller Blind - Blockout', 'Complete light blocking roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true,
     'per_metre', 55.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Roller Blind - Sunscreen', 'UV protective sunscreen roller blind', 'roller_blinds', 'roller_blind', 
     true, system_user_id, true,
     'per_metre', 50.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),

    -- Roman Blinds
    ('Roman Blind - Flat', 'Classic flat fold roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true,
     'per_metre', 85.00, 'machine',
     'wide', 'standard', 1.0, 'Flat'),
    
    ('Roman Blind - Cascade', 'Elegant cascade style roman blind', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true,
     'per_metre', 95.00, 'hand',
     'wide', 'standard', 1.0, 'Cascade'),
    
    ('Roman Blind - Hobbled', 'Luxurious hobbled roman blind with permanent folds', 'roman_blinds', 'roman_blind', 
     true, system_user_id, true,
     'per_metre', 105.00, 'hand',
     'wide', 'standard', 1.0, 'Hobbled'),

    -- Venetian Blinds
    ('Venetian Blind - Aluminum', 'Durable aluminum slat venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true,
     'per_metre', 40.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Venetian Blind - Wood', 'Premium timber venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true,
     'per_metre', 75.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Venetian Blind - Faux Wood', 'Moisture-resistant faux wood venetian blind', 'venetian_blinds', 'venetian_blind', 
     true, system_user_id, true,
     'per_metre', 55.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),

    -- Vertical Blinds
    ('Vertical Blind - Fabric', 'Fabric vane vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true,
     'per_metre', 50.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Vertical Blind - PVC', 'Durable PVC vertical blind', 'vertical_blinds', 'vertical_blind', 
     true, system_user_id, true,
     'per_metre', 45.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),

    -- Panel Glide
    ('Panel Glide', 'Modern panel track system', 'panel_glide', 'panel_glide', 
     true, system_user_id, true,
     'per_metre', 65.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),

    -- Plantation Shutters
    ('Plantation Shutter - Basswood', 'Premium basswood plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true,
     'per_metre', 450.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Plantation Shutter - PVC', 'Moisture-resistant PVC plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true,
     'per_metre', 350.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Plantation Shutter - Aluminum', 'Durable aluminum plantation shutters', 'shutters', 'plantation_shutter', 
     true, system_user_id, true,
     'per_metre', 400.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),

    -- Cellular/Honeycomb Shades
    ('Cellular Shade - Single Cell', 'Energy efficient single cell honeycomb shade', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true,
     'per_metre', 60.00, 'machine',
     'wide', 'standard', 1.0, 'Standard'),
    
    ('Cellular Shade - Double Cell', 'Premium double cell honeycomb shade for maximum insulation', 'cellular_shades', 'cellular_shade', 
     true, system_user_id, true,
     'per_metre', 75.00, 'machine',
     'wide', 'standard', 1.0, 'Standard')
  ON CONFLICT DO NOTHING;
END;
$$;

-- Execute the function to create templates
SELECT create_system_blind_templates();