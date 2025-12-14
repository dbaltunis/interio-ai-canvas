-- Comprehensive TWC Integration Fixes
-- 1. Hide TWC heading_type options (duplicates system headings) for ALL accounts
UPDATE treatment_options 
SET visible = false 
WHERE key = 'heading_type' AND source = 'twc';

-- 2. Set default fabric width (300cm) for TWC materials missing width
-- Wide width fabrics (roller, roman, curtain, panel glide) typically 300cm
UPDATE enhanced_inventory_items 
SET fabric_width = 300
WHERE supplier = 'TWC' 
AND fabric_width IS NULL
AND subcategory IN ('roller_fabric', 'roman_fabric', 'curtain_fabric', 'panel_glide_fabric', 'awning_fabric');

-- 3. Set default fabric width (300cm) for materials too (cellular, etc.)
UPDATE enhanced_inventory_items 
SET fabric_width = 300
WHERE supplier = 'TWC' 
AND fabric_width IS NULL
AND category = 'material'
AND subcategory IN ('cellular', 'panel_glide_fabric');

-- 4. Add opacity/type tags to TWC items for better filtering
-- Blockout tag
UPDATE enhanced_inventory_items
SET tags = COALESCE(tags, '{}') || ARRAY['blockout']::text[]
WHERE supplier = 'TWC' 
AND (name ILIKE '%blockout%' OR description ILIKE '%blockout%')
AND NOT ('blockout' = ANY(COALESCE(tags, '{}')));

-- Sheer tag
UPDATE enhanced_inventory_items
SET tags = COALESCE(tags, '{}') || ARRAY['sheer']::text[]
WHERE supplier = 'TWC' 
AND (name ILIKE '%sheer%' OR description ILIKE '%sheer%')
AND NOT ('sheer' = ANY(COALESCE(tags, '{}')));

-- Sunscreen tag
UPDATE enhanced_inventory_items
SET tags = COALESCE(tags, '{}') || ARRAY['sunscreen']::text[]
WHERE supplier = 'TWC' 
AND (name ILIKE '%sunscreen%' OR description ILIKE '%sunscreen%')
AND NOT ('sunscreen' = ANY(COALESCE(tags, '{}')));

-- Light filtering tag
UPDATE enhanced_inventory_items
SET tags = COALESCE(tags, '{}') || ARRAY['light_filtering']::text[]
WHERE supplier = 'TWC' 
AND (name ILIKE '%light filter%' OR description ILIKE '%light filter%' OR name ILIKE '%translucent%')
AND NOT ('light_filtering' = ANY(COALESCE(tags, '{}')));

-- Wide width tag (fabric_width >= 250cm)
UPDATE enhanced_inventory_items
SET tags = COALESCE(tags, '{}') || ARRAY['wide_width']::text[]
WHERE supplier = 'TWC' 
AND fabric_width >= 250
AND NOT ('wide_width' = ANY(COALESCE(tags, '{}')));

-- 5. Add index for faster tag-based filtering
CREATE INDEX IF NOT EXISTS idx_inventory_tags_gin ON enhanced_inventory_items USING GIN (tags);

-- 6. Add index for price_group filtering
CREATE INDEX IF NOT EXISTS idx_inventory_price_group ON enhanced_inventory_items (price_group) WHERE price_group IS NOT NULL;