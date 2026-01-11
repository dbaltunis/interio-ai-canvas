-- Add color tags to Zebra Blind materials for color selector
UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['White']
WHERE name LIKE '%White%' AND subcategory = 'zebra_fabric' AND NOT ('White' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Cream']
WHERE name LIKE '%Cream%' AND subcategory = 'zebra_fabric' AND NOT ('Cream' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Grey']
WHERE name LIKE '%Grey%' AND subcategory = 'zebra_fabric' AND NOT ('Grey' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Beige']
WHERE name LIKE '%Beige%' AND subcategory = 'zebra_fabric' AND NOT ('Beige' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Silver']
WHERE name LIKE '%Silver%' AND subcategory = 'zebra_fabric' AND NOT ('Silver' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Natural']
WHERE name LIKE '%Natural%' AND subcategory = 'zebra_fabric' AND NOT ('Natural' = ANY(COALESCE(tags, '{}')));

UPDATE enhanced_inventory_items 
SET tags = COALESCE(tags, '{}') || ARRAY['Walnut']
WHERE name LIKE '%Walnut%' AND subcategory = 'zebra_fabric' AND NOT ('Walnut' = ANY(COALESCE(tags, '{}')));