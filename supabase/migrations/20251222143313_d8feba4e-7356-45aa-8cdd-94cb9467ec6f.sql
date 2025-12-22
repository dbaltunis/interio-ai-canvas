-- Fix blinds: set category to 'material' and subcategory to 'roller_fabric'
UPDATE enhanced_inventory_items 
SET category = 'material', subcategory = 'roller_fabric', updated_at = now()
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND category = 'Blinds';

-- Fix tracks: set category to 'hardware' (lowercase) and subcategory to 'track'
UPDATE enhanced_inventory_items 
SET category = 'hardware', subcategory = 'track', updated_at = now()
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND category = 'Hardware'
  AND subcategory = 'Curtain Tracks';

-- Fix rods: set category to 'hardware' (lowercase) and subcategory to 'rod'
UPDATE enhanced_inventory_items 
SET category = 'hardware', subcategory = 'rod', updated_at = now()
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND category = 'Hardware'
  AND subcategory = 'Rods';