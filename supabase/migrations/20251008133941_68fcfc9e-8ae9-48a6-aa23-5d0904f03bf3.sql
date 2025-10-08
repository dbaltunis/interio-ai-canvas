-- Create a sample Roller Blind template for testing
INSERT INTO curtain_templates (
  user_id,
  name,
  description,
  treatment_category,
  curtain_type,
  heading_name,
  fullness_ratio,
  fabric_width_type,
  fabric_direction,
  bottom_hem,
  side_hems,
  seam_hems,
  return_left,
  return_right,
  overlap,
  header_allowance,
  waste_percent,
  is_railroadable,
  compatible_hardware,
  lining_types,
  pricing_type,
  manufacturing_type,
  machine_price_per_metre,
  active
)
SELECT 
  user_id,
  'Standard Roller Blind',
  'Professional motorized roller blind system with bottom bar weight',
  'roller_blinds',
  'single',
  'No Heading',
  1.0,
  'wide',
  'standard',
  0,
  0,
  0,
  0,
  0,
  0,
  5,
  3,
  false,
  ARRAY['Roller System', 'Motorized Roller'],
  '[]'::jsonb,
  'per_metre',
  'machine',
  45.00,
  true
FROM user_profiles
WHERE user_id = (SELECT user_id FROM user_profiles LIMIT 1)
LIMIT 1;

-- Update some existing fabric inventory items to be roller blind fabrics
UPDATE enhanced_inventory_items
SET category = 'roller_blind_fabric'
WHERE id IN (
  SELECT id FROM enhanced_inventory_items
  WHERE category IN ('Fabric', 'fabric')
    AND active = true
  LIMIT 5
);
