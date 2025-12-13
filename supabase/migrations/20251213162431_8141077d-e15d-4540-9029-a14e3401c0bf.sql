-- Fix remaining blind_material items to more specific subcategories based on name patterns
UPDATE enhanced_inventory_items 
SET subcategory = 'vertical_slats'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%vertical%' OR name ILIKE '%vane%');

UPDATE enhanced_inventory_items 
SET subcategory = 'cellular'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%cellular%' OR name ILIKE '%honeycomb%' OR name ILIKE '%duette%');

UPDATE enhanced_inventory_items 
SET subcategory = 'venetian_slats'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%venetian%' OR name ILIKE '%slat%' OR name ILIKE '%aluminium%' OR name ILIKE '%wood%');

UPDATE enhanced_inventory_items 
SET subcategory = 'panel_glide_fabric'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%panel%' OR name ILIKE '%glide%');