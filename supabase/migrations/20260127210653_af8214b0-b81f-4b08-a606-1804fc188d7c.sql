-- Create 6 collections for venetian slat materials and link materials
-- First, insert the collections
WITH new_collections AS (
  INSERT INTO collections (user_id, name, description, vendor_id, active)
  SELECT 
    '32a92783-f482-4e3d-8ebf-c292200674e5' as user_id,
    CASE price_group
      WHEN 'BASSWOOD_25' THEN 'Basswood 25mm'
      WHEN 'BASSWOOD_50' THEN 'Basswood 50mm'
      WHEN 'BAMBOO_25' THEN 'Bamboo 25mm'
      WHEN 'BAMBOO_50' THEN 'Bamboo 50mm'
      WHEN 'ABACHI_50' THEN 'Abachi 50mm'
      WHEN 'PAULOWNIA_50' THEN 'Paulownia 50mm'
    END as name,
    'Medinės žaliuzės - ' || 
    CASE price_group
      WHEN 'BASSWOOD_25' THEN 'Liepmedis 25mm'
      WHEN 'BASSWOOD_50' THEN 'Liepmedis 50mm'
      WHEN 'BAMBOO_25' THEN 'Bambukas 25mm'
      WHEN 'BAMBOO_50' THEN 'Bambukas 50mm'
      WHEN 'ABACHI_50' THEN 'Abachi 50mm'
      WHEN 'PAULOWNIA_50' THEN 'Paulovnija 50mm'
    END as description,
    'f7e8d9c0-1234-5678-9abc-def012345678' as vendor_id,
    true as active
  FROM (
    SELECT DISTINCT price_group 
    FROM enhanced_inventory_items 
    WHERE user_id = '32a92783-f482-4e3d-8ebf-c292200674e5' 
      AND subcategory = 'venetian_slats'
      AND price_group IS NOT NULL
  ) pg
  RETURNING id, name
)
-- Now link the materials to their collections
UPDATE enhanced_inventory_items eii
SET collection_id = c.id
FROM collections c
WHERE eii.user_id = c.user_id
  AND eii.user_id = '32a92783-f482-4e3d-8ebf-c292200674e5'
  AND eii.subcategory = 'venetian_slats'
  AND c.name = CASE eii.price_group
    WHEN 'BASSWOOD_25' THEN 'Basswood 25mm'
    WHEN 'BASSWOOD_50' THEN 'Basswood 50mm'
    WHEN 'BAMBOO_25' THEN 'Bamboo 25mm'
    WHEN 'BAMBOO_50' THEN 'Bamboo 50mm'
    WHEN 'ABACHI_50' THEN 'Abachi 50mm'
    WHEN 'PAULOWNIA_50' THEN 'Paulownia 50mm'
  END;