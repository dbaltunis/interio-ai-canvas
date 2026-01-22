-- Fix existing misclassified awning materials for all accounts
-- These are TWC products that should be fabric/awning_fabric but were imported as material/roller_fabric

UPDATE enhanced_inventory_items
SET 
  category = 'fabric',
  subcategory = 'awning_fabric',
  updated_at = NOW()
WHERE supplier = 'TWC'
AND category = 'material'
AND subcategory = 'roller_fabric'
AND (
  -- SKU-based detection (primary - most reliable)
  sku LIKE '700%' OR sku LIKE '700-%' OR
  sku LIKE '710%' OR sku LIKE '710-%' OR
  sku LIKE '720%' OR sku LIKE '720-%' OR
  sku LIKE '730%' OR sku LIKE '730-%' OR
  sku LIKE '735%' OR sku LIKE '735-%' OR
  sku LIKE '740%' OR sku LIKE '740-%' OR
  sku LIKE '750%' OR sku LIKE '750-%' OR
  sku LIKE '770%' OR sku LIKE '770-%' OR
  sku LIKE '800%' OR sku LIKE '800-%' OR
  sku LIKE '805%' OR sku LIKE '805-%' OR
  sku LIKE '810%' OR sku LIKE '810-%' OR
  sku LIKE '820%' OR sku LIKE '820-%' OR
  -- Name-based detection (secondary)
  LOWER(name) LIKE '%auto%' OR
  LOWER(name) LIKE '%zip screen%' OR
  LOWER(name) LIKE '%straight drop%' OR
  LOWER(name) LIKE '%folding arm%' OR
  LOWER(name) LIKE '%conservatory%' OR
  LOWER(name) LIKE '%patio%' OR
  LOWER(name) LIKE '%fixed guide%'
);