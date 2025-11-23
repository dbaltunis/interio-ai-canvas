-- Add inventory materials for Cellular, Venetian, and Vertical blinds
-- These work like roller blind fabrics - you select them and pricing grid applies

-- CELLULAR SHADE MATERIALS
INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Single Cell Cellular Fabric',
  'Single cell honeycomb material for energy efficient shades',
  'material',
  'cellular',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'cellular_single',
  'standard'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Single Cell Cellular Fabric' AND user_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Double Cell Cellular Fabric',
  'Double cell honeycomb material for maximum insulation',
  'material',
  'cellular',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'cellular_double',
  'premium'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Double Cell Cellular Fabric' AND user_id = '00000000-0000-0000-0000-000000000000'
);

-- VENETIAN BLIND SLATS
INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Aluminum Slats - 25mm',
  '25mm aluminum venetian slats',
  'material',
  'venetian',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'venetian_25mm',
  'standard'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Aluminum Slats - 25mm' AND user_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Aluminum Slats - 50mm',
  '50mm aluminum venetian slats',
  'material',
  'venetian',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'venetian_50mm',
  'standard'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Aluminum Slats - 50mm' AND user_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Wooden Slats - 50mm',
  '50mm wooden venetian slats',
  'material',
  'venetian',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'venetian_wood',
  'premium'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Wooden Slats - 50mm' AND user_id = '00000000-0000-0000-0000-000000000000'
);

-- VERTICAL BLIND LOUVRES
INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Vertical Louvres - 89mm',
  '89mm vertical blind louvres',
  'material',
  'vertical',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'vertical_89mm',
  'standard'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Vertical Louvres - 89mm' AND user_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO enhanced_inventory_items (
  user_id,
  name,
  description,
  category,
  subcategory,
  cost_price,
  selling_price,
  unit,
  active,
  show_in_quote,
  system_type,
  price_group
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'Vertical Louvres - 127mm',
  '127mm vertical blind louvres',
  'material',
  'vertical',
  0.00,
  0.00,
  'sqm',
  true,
  true,
  'vertical_127mm',
  'standard'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items 
  WHERE name = 'Vertical Louvres - 127mm' AND user_id = '00000000-0000-0000-0000-000000000000'
);