-- Fix remaining blind_material items that weren't caught by name-based patterns
-- Check what's left in blind_material
-- These are likely TWC products that need more specific pattern matching

-- Update Auto products to roller_fabric
UPDATE enhanced_inventory_items 
SET subcategory = 'roller_fabric'
WHERE subcategory = 'blind_material' 
  AND name ILIKE 'Auto%';

-- Update any remaining blind_material based on metadata description
UPDATE enhanced_inventory_items 
SET subcategory = 'roller_fabric'
WHERE subcategory = 'blind_material' 
  AND metadata->>'twc_description' ILIKE '%roller%';

UPDATE enhanced_inventory_items 
SET subcategory = 'venetian_slats'
WHERE subcategory = 'blind_material' 
  AND metadata->>'twc_description' ILIKE '%venetian%';

UPDATE enhanced_inventory_items 
SET subcategory = 'vertical_slats'
WHERE subcategory = 'blind_material' 
  AND metadata->>'twc_description' ILIKE '%vertical%';

UPDATE enhanced_inventory_items 
SET subcategory = 'cellular'
WHERE subcategory = 'blind_material' 
  AND (metadata->>'twc_description' ILIKE '%cellular%' OR metadata->>'twc_description' ILIKE '%honeycomb%');

UPDATE enhanced_inventory_items 
SET subcategory = 'panel_glide_fabric'
WHERE subcategory = 'blind_material' 
  AND metadata->>'twc_description' ILIKE '%panel%';

-- Consolidate venetian/vertical without _slats suffix
UPDATE enhanced_inventory_items 
SET subcategory = 'venetian_slats'
WHERE subcategory = 'venetian';

UPDATE enhanced_inventory_items 
SET subcategory = 'vertical_slats'
WHERE subcategory = 'vertical';