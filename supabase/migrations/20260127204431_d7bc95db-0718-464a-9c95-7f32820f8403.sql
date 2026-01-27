-- Update collection descriptions to show supplier names
UPDATE collections c
SET description = subquery.supplier_name
FROM (
  SELECT c2.id, COALESCE(
    (SELECT UPPER(ei.supplier) 
     FROM enhanced_inventory_items ei 
     WHERE ei.collection_id = c2.id 
     AND ei.supplier IS NOT NULL 
     AND ei.supplier != ''
     LIMIT 1),
    NULL
  ) as supplier_name
  FROM collections c2
  WHERE c2.user_id = '32a92783-f482-4e3d-8ebf-c292200674e5'
    AND c2.description = 'Auto-created from fabric imports'
) AS subquery
WHERE c.id = subquery.id
  AND subquery.supplier_name IS NOT NULL;