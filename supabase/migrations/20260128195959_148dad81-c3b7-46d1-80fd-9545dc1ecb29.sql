-- Step 1: Create collections from TWC parent product names (handle duplicates with NOT EXISTS)
INSERT INTO collections (user_id, name, vendor_id, description, season, active)
SELECT DISTINCT
  eii.user_id,
  UPPER(eii.name),
  eii.vendor_id,
  'TWC Collection: ' || eii.name,
  'All Season',
  true
FROM enhanced_inventory_items eii
WHERE eii.supplier = 'TWC' 
  AND (eii.metadata->>'parent_product_id' IS NULL OR eii.metadata->>'parent_product_id' = '')
  AND eii.collection_id IS NULL
  AND LOWER(eii.name) NOT IN ('verticals', 'honeycells', 'new recloth', 'zip screen', 
                               'roller blinds', 'venetian blinds', 'curtains', 'shutters', 
                               'awnings', 'panel glide', 'cellular blinds', 'roman blinds')
  AND NOT EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.user_id = eii.user_id AND c.name = UPPER(eii.name)
  );

-- Step 2: Link parent products to their collections
UPDATE enhanced_inventory_items eii
SET collection_id = c.id
FROM collections c
WHERE eii.supplier = 'TWC'
  AND (eii.metadata->>'parent_product_id' IS NULL OR eii.metadata->>'parent_product_id' = '')
  AND eii.collection_id IS NULL
  AND eii.user_id = c.user_id
  AND UPPER(eii.name) = c.name;

-- Step 3: Link child materials to their parent's collection
UPDATE enhanced_inventory_items child
SET collection_id = parent.collection_id
FROM enhanced_inventory_items parent
WHERE child.metadata->>'parent_product_id' = parent.id::text
  AND child.collection_id IS NULL
  AND parent.collection_id IS NOT NULL;