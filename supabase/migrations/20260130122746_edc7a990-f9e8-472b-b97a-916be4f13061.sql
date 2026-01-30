-- Fix existing TWC items: Set compatible_treatments based on subcategory
-- This updates ALL users' TWC items, not just one account

-- Fix awning fabrics
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['awning']
WHERE subcategory = 'awning_fabric' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix roller fabrics
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['roller_blinds', 'zebra_blinds']
WHERE subcategory = 'roller_fabric' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix curtain fabrics
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['curtains', 'roman_blinds']
WHERE subcategory = 'curtain_fabric' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix vertical slats and vertical fabric
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['vertical_blinds']
WHERE subcategory IN ('vertical_slats', 'vertical_fabric')
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix venetian slats
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['venetian_blinds']
WHERE subcategory = 'venetian_slats' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix panel glide
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['panel_glide']
WHERE subcategory = 'panel_glide_fabric' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix cellular
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['cellular_blinds']
WHERE subcategory = 'cellular' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Fix shutter materials
UPDATE enhanced_inventory_items
SET compatible_treatments = ARRAY['shutters', 'plantation_shutters']
WHERE subcategory = 'shutter_material' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');

-- Normalize pricing_method to canonical values for consistency
UPDATE enhanced_inventory_items
SET pricing_method = 'pricing_grid'
WHERE pricing_method IN ('grid', 'price_grid', 'pricing-grid')
  AND pricing_method != 'pricing_grid';

UPDATE enhanced_inventory_items
SET pricing_method = 'per-linear-meter'
WHERE pricing_method = 'linear';

-- Set pricing_method for TWC items that are missing it
UPDATE enhanced_inventory_items
SET pricing_method = 'pricing_grid'
WHERE supplier = 'TWC'
  AND subcategory IN ('roller_fabric', 'venetian_slats', 'vertical_slats', 'vertical_fabric',
                      'cellular', 'shutter_material', 'panel_glide_fabric', 'awning_fabric', 'blind_material')
  AND (pricing_method IS NULL OR pricing_method = '');

UPDATE enhanced_inventory_items
SET pricing_method = 'per-linear-meter'
WHERE supplier = 'TWC'
  AND subcategory IN ('curtain_fabric', 'lining_fabric', 'sheer_fabric')
  AND (pricing_method IS NULL OR pricing_method = '');