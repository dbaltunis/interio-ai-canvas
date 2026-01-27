-- Step 1: Create collections from unique collection_name values
INSERT INTO collections (id, user_id, name, description, active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  collection_name,
  'Auto-created from fabric imports',
  true,
  NOW(),
  NOW()
FROM enhanced_inventory_items
WHERE user_id = '32a92783-f482-4e3d-8ebf-c292200674e5'
  AND collection_name IS NOT NULL
  AND collection_name != ''
GROUP BY collection_name;

-- Step 2: Link inventory items to their collections
UPDATE enhanced_inventory_items ei
SET collection_id = c.id
FROM collections c
WHERE ei.collection_name = c.name
  AND ei.user_id = c.user_id
  AND ei.user_id = '32a92783-f482-4e3d-8ebf-c292200674e5';