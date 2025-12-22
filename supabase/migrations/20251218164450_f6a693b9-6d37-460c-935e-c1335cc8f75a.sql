-- Fix Daniel's 57 incorrectly categorized curtain fabrics
-- These were imported as 'material/roller_fabric' but should be 'fabric/curtain_fabric'

UPDATE enhanced_inventory_items
SET 
  category = 'fabric',
  subcategory = 'curtain_fabric',
  updated_at = now()
WHERE user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND metadata->>'parent_product_id' = '2fa45e45-5932-4683-97bf-dd5b0a8c9852'
AND category = 'material'
AND subcategory = 'roller_fabric';

-- Also fix any Roman blind fabrics that may have the same issue
UPDATE enhanced_inventory_items
SET 
  category = 'fabric',
  subcategory = 'roman_fabric',
  updated_at = now()
WHERE user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND metadata->>'parent_product_id' IN (
  SELECT id::text FROM enhanced_inventory_items 
  WHERE user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
  AND LOWER(name) LIKE '%roman%'
  AND metadata->>'parent_product_id' IS NULL
)
AND category = 'material';