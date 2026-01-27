-- Step 1: Create vendors for each unique orphan supplier found in collections
-- This inserts new vendor records based on supplier names from inventory items linked to orphan collections
INSERT INTO vendors (user_id, name, active, company_type)
SELECT DISTINCT 
  c.user_id,
  INITCAP(orphan_supplier.supplier) as name,
  true,
  'supplier'
FROM collections c
CROSS JOIN LATERAL (
  SELECT DISTINCT supplier 
  FROM enhanced_inventory_items 
  WHERE collection_id = c.id 
  AND supplier IS NOT NULL
  AND supplier != ''
  LIMIT 1
) orphan_supplier
WHERE c.vendor_id IS NULL
  AND orphan_supplier.supplier IS NOT NULL
  AND orphan_supplier.supplier != ''
  AND NOT EXISTS (
    SELECT 1 FROM vendors v 
    WHERE LOWER(TRIM(v.name)) = LOWER(TRIM(orphan_supplier.supplier))
    AND v.user_id = c.user_id
  );

-- Step 2: Link orphan collections to their matching vendors (newly created or existing)
UPDATE collections c
SET vendor_id = v.id
FROM vendors v
WHERE c.vendor_id IS NULL
  AND c.user_id = v.user_id
  AND LOWER(TRIM(v.name)) = LOWER(TRIM(
    (SELECT DISTINCT supplier 
     FROM enhanced_inventory_items 
     WHERE collection_id = c.id 
     AND supplier IS NOT NULL 
     AND supplier != ''
     LIMIT 1)
  ));