-- Add subcategory field to enhanced_inventory_items table
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS subcategory text;

-- Add index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_items_subcategory 
ON enhanced_inventory_items(subcategory);

-- Add index for category + subcategory combination
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_items_cat_subcat 
ON enhanced_inventory_items(category, subcategory);

-- Update existing records to have proper category/subcategory structure
-- Map existing fabric types to proper structure
UPDATE enhanced_inventory_items 
SET 
  category = 'fabric',
  subcategory = CASE 
    WHEN category = 'curtain_fabric' THEN 'curtain_fabric'
    WHEN category = 'roller_blind_fabric' THEN 'roller_fabric'
    WHEN category = 'blind_fabric' THEN 'blind_fabric'
    WHEN category = 'furniture_fabric' THEN 'furniture_fabric'
    WHEN category = 'sheer_fabric' THEN 'sheer_fabric'
    WHEN category = 'upholstery_fabric' THEN 'furniture_fabric'
    WHEN category LIKE '%fabric%' THEN category
    ELSE category
  END
WHERE category IN ('curtain_fabric', 'roller_blind_fabric', 'blind_fabric', 'furniture_fabric', 'sheer_fabric', 'upholstery_fabric')
   OR category LIKE '%fabric%';

-- Map existing hardware types
UPDATE enhanced_inventory_items 
SET 
  category = 'hardware',
  subcategory = CASE 
    WHEN category = 'track' THEN 'track'
    WHEN category = 'rod' THEN 'rod'
    WHEN category = 'bracket' THEN 'bracket'
    WHEN category = 'motor' THEN 'motor'
    WHEN category = 'accessory' THEN 'accessory'
    ELSE category
  END
WHERE category IN ('track', 'rod', 'bracket', 'motor', 'accessory');

-- Map existing wallcovering types
UPDATE enhanced_inventory_items 
SET 
  category = 'wallcovering',
  subcategory = COALESCE(subcategory, 'plain_wallpaper')
WHERE category IN ('wallcovering', 'wallpaper');

-- Add comment to explain the schema
COMMENT ON COLUMN enhanced_inventory_items.category IS 'Main category: fabric, hardware, wallcovering';
COMMENT ON COLUMN enhanced_inventory_items.subcategory IS 'Subcategory within the main category for more specific filtering';