-- Backfill price_group on venetian materials based on name patterns
-- This enables pricing grid matching for TWC-imported materials

-- Aluminium venetian blinds - standard groups
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%25mm%' AND name ILIKE '%alumin%' THEN 'ALUMINIUM_25MM'
  WHEN name ILIKE '%50mm%' AND name ILIKE '%alumin%' THEN 'ALUMINIUM_50MM'
  WHEN name ILIKE '%alumin%' THEN 'ALUMINIUM_STANDARD'
  ELSE price_group
END
WHERE subcategory = 'venetian_slats'
  AND category IN ('material', 'hard_coverings')
  AND price_group IS NULL
  AND name ILIKE '%alumin%';

-- Wood venetian blinds
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%35mm%' THEN 'WOOD_35MM'
  WHEN name ILIKE '%50mm%' THEN 'WOOD_50MM'
  WHEN name ILIKE '%63mm%' OR name ILIKE '%65mm%' THEN 'WOOD_63MM'
  ELSE 'WOOD_STANDARD'
END
WHERE subcategory = 'venetian_slats'
  AND category IN ('material', 'hard_coverings')
  AND price_group IS NULL
  AND (name ILIKE '%wood%' OR name ILIKE '%timber%' OR name ILIKE '%pure wood%');

-- Faux wood / Visionwood venetian blinds
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%50mm%' THEN 'FAUXWOOD_50MM'
  WHEN name ILIKE '%63mm%' OR name ILIKE '%65mm%' THEN 'FAUXWOOD_63MM'
  ELSE 'FAUXWOOD_STANDARD'
END
WHERE subcategory = 'venetian_slats'
  AND category IN ('material', 'hard_coverings')
  AND price_group IS NULL
  AND (name ILIKE '%faux%' OR name ILIKE '%vision%' OR name ILIKE '%pvc%');

-- Cellular/honeycomb blinds
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%blockout%' OR name ILIKE '%block out%' THEN 'CELLULAR_BLOCKOUT'
  WHEN name ILIKE '%light filter%' OR name ILIKE '%translucent%' THEN 'CELLULAR_LIGHT'
  ELSE 'CELLULAR_STANDARD'
END
WHERE subcategory IN ('cellular_fabric', 'honeycomb_fabric')
  AND category IN ('fabric', 'material')
  AND price_group IS NULL;

-- Roller blind materials
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%blockout%' OR name ILIKE '%block out%' THEN 'ROLLER_BLOCKOUT'
  WHEN name ILIKE '%sunscreen%' OR name ILIKE '%screen%' THEN 'ROLLER_SUNSCREEN'
  WHEN name ILIKE '%light filter%' OR name ILIKE '%translucent%' THEN 'ROLLER_LIGHT'
  ELSE 'ROLLER_STANDARD'
END
WHERE subcategory IN ('roller_fabric', 'roller_material')
  AND category IN ('fabric', 'material')
  AND price_group IS NULL;

-- Shutter panels
UPDATE enhanced_inventory_items
SET price_group = CASE
  WHEN name ILIKE '%basswood%' OR name ILIKE '%timber%' THEN 'SHUTTER_TIMBER'
  WHEN name ILIKE '%pvc%' OR name ILIKE '%vinyl%' THEN 'SHUTTER_PVC'
  WHEN name ILIKE '%alumin%' THEN 'SHUTTER_ALUMINIUM'
  ELSE 'SHUTTER_STANDARD'
END
WHERE subcategory IN ('shutter_panel', 'shutter')
  AND category IN ('material', 'hard_coverings')
  AND price_group IS NULL;

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM enhanced_inventory_items
  WHERE price_group IS NOT NULL
    AND category IN ('material', 'hard_coverings', 'fabric')
    AND updated_at > NOW() - INTERVAL '5 minutes';
  
  RAISE NOTICE 'Updated % materials with price_group', updated_count;
END $$;