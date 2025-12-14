-- Add fabric width to cellular materials that are missing it
UPDATE enhanced_inventory_items
SET fabric_width = 300
WHERE supplier = 'TWC'
  AND fabric_width IS NULL
  AND (subcategory = 'cellular' OR subcategory = 'honeycomb' OR category = 'cellular');

-- Add wide_width tag to cellular materials with 300cm width
UPDATE enhanced_inventory_items
SET tags = array_append(COALESCE(tags, ARRAY[]::text[]), 'wide_width')
WHERE supplier = 'TWC'
  AND fabric_width = 300
  AND (subcategory = 'cellular' OR subcategory = 'honeycomb')
  AND NOT ('wide_width' = ANY(COALESCE(tags, ARRAY[]::text[])));