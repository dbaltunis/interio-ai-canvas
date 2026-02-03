-- Backfill: Create collection records from unique collection_name values
INSERT INTO collections (name, user_id, active, created_at, updated_at)
SELECT DISTINCT 
  collection_name as name, 
  user_id, 
  true as active, 
  now() as created_at, 
  now() as updated_at
FROM enhanced_inventory_items
WHERE collection_name IS NOT NULL 
  AND collection_name != ''
  AND collection_id IS NULL
ON CONFLICT (name, user_id) DO NOTHING;

-- Backfill: Link inventory items to their newly created collections
UPDATE enhanced_inventory_items ei
SET collection_id = c.id,
    updated_at = now()
FROM collections c
WHERE ei.collection_name = c.name
  AND ei.user_id = c.user_id
  AND ei.collection_id IS NULL;