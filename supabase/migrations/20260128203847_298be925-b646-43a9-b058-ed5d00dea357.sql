-- Step 1: Deduplicate collections more aggressively using ROW_NUMBER
-- Keep the oldest record per (user_id, name) pair
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, name 
           ORDER BY created_at ASC
         ) as rn
  FROM collections
)
DELETE FROM collections 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE collections ADD CONSTRAINT collections_user_id_name_unique UNIQUE (user_id, name);

-- Step 3: Create collections from child material names for orphaned TWC items
WITH child_collections AS (
  SELECT DISTINCT 
    user_id,
    vendor_id,
    UPPER(TRIM(SUBSTRING(name FROM ' - (.+)$'))) as collection_name
  FROM enhanced_inventory_items
  WHERE supplier = 'TWC'
    AND collection_id IS NULL
    AND metadata->>'parent_product_id' IS NOT NULL
    AND SUBSTRING(name FROM ' - (.+)$') IS NOT NULL
)
INSERT INTO collections (user_id, name, vendor_id, description, season, active)
SELECT 
  user_id,
  collection_name,
  vendor_id,
  'TWC Collection: ' || collection_name,
  'All Season',
  true
FROM child_collections
WHERE collection_name IS NOT NULL
  AND collection_name != ''
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 4: Link orphaned TWC children to their collections
UPDATE enhanced_inventory_items eii
SET collection_id = c.id
FROM collections c
WHERE eii.supplier = 'TWC'
  AND eii.collection_id IS NULL
  AND eii.user_id = c.user_id
  AND UPPER(TRIM(SUBSTRING(eii.name FROM ' - (.+)$'))) = c.name;