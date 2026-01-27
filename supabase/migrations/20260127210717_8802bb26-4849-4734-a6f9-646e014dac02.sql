-- Link venetian slat materials to their collections
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