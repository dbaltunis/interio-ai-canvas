-- Fix TWC roller fabrics: change category from 'fabric' to 'material' for roller blinds
UPDATE enhanced_inventory_items 
SET category = 'material'
WHERE subcategory = 'roller_fabric' AND category = 'fabric';

-- Fix generic blind_material items by recategorizing based on name
-- Roller Blinds
UPDATE enhanced_inventory_items 
SET subcategory = 'roller_fabric'
WHERE subcategory = 'blind_material' 
  AND (name ILIKE 'Roller%' OR name ILIKE 'Auto%' OR metadata->>'twc_description' ILIKE '%roller%');

-- Romans (these should be fabric, not material)
UPDATE enhanced_inventory_items 
SET subcategory = 'roman_fabric', category = 'fabric'
WHERE subcategory = 'blind_material' 
  AND name ILIKE 'Romans%';

-- Curtains (these should be fabric)
UPDATE enhanced_inventory_items 
SET subcategory = 'curtain_fabric', category = 'fabric'
WHERE subcategory = 'blind_material' 
  AND name ILIKE 'Curtains%';

-- Venetian Blinds
UPDATE enhanced_inventory_items 
SET subcategory = 'venetian_slats'
WHERE subcategory = 'blind_material' 
  AND (name ILIKE 'Aluminium%' OR name ILIKE 'Basswood%' OR name ILIKE 'Visionwood%' OR name ILIKE 'Venetian%' OR metadata->>'twc_description' ILIKE '%venetian%');

-- Panel Glide
UPDATE enhanced_inventory_items 
SET subcategory = 'panel_glide_fabric'
WHERE subcategory = 'blind_material' 
  AND (name ILIKE 'Panel%' OR name ILIKE 'Glide%' OR metadata->>'twc_description' ILIKE '%panel%');

-- Vertical Blinds
UPDATE enhanced_inventory_items 
SET subcategory = 'vertical_slats'
WHERE subcategory = 'blind_material' 
  AND (name ILIKE 'Vertical%' OR metadata->>'twc_description' ILIKE '%vertical%');

-- Cellular/Honeycomb
UPDATE enhanced_inventory_items 
SET subcategory = 'cellular'
WHERE subcategory = 'blind_material' 
  AND (name ILIKE 'Cellular%' OR name ILIKE 'Honeycomb%' OR metadata->>'twc_description' ILIKE '%cellular%' OR metadata->>'twc_description' ILIKE '%honeycomb%');

-- Link TWC items to TWC vendor if exists
UPDATE enhanced_inventory_items e
SET vendor_id = v.id
FROM vendors v
WHERE e.supplier = 'TWC' 
  AND v.name ILIKE '%TWC%'
  AND e.vendor_id IS NULL;