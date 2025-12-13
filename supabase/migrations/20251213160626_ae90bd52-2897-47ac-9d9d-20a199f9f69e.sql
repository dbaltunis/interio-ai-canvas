-- Phase 1: Update existing TWC items to populate price_group from metadata
UPDATE enhanced_inventory_items 
SET price_group = metadata->>'twc_pricing_group'
WHERE supplier = 'TWC' 
AND (price_group IS NULL OR price_group = '')
AND metadata->>'twc_pricing_group' IS NOT NULL;

-- Phase 2: Fix subcategory classification for existing TWC items
-- Roller materials
UPDATE enhanced_inventory_items 
SET subcategory = 'roller_fabric'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%roller%' OR metadata->>'twc_description' ILIKE '%roller%');

-- Venetian materials  
UPDATE enhanced_inventory_items 
SET subcategory = 'venetian_slats'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%venetian%' OR name ILIKE '%aluminium%' OR name ILIKE '%wood%' OR name ILIKE '%slat%');

-- Vertical materials
UPDATE enhanced_inventory_items 
SET subcategory = 'vertical_slats'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%vertical%');

-- Cellular materials
UPDATE enhanced_inventory_items 
SET subcategory = 'cellular'
WHERE supplier = 'TWC' 
AND subcategory = 'blind_material'
AND (name ILIKE '%cellular%' OR name ILIKE '%honeycomb%');

-- Phase 3: Add source column to treatment_options for TWC identification
ALTER TABLE treatment_options ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';