-- Clean invalid example.com URLs from enhanced_inventory_items
-- These placeholder URLs never load and prevent proper fallback display

UPDATE enhanced_inventory_items 
SET image_url = NULL 
WHERE image_url LIKE '%example.com%';

-- Also clean any obviously invalid URLs
UPDATE enhanced_inventory_items 
SET image_url = NULL 
WHERE image_url IS NOT NULL 
AND image_url != '' 
AND image_url NOT LIKE 'http%' 
AND image_url NOT LIKE 'data:%';