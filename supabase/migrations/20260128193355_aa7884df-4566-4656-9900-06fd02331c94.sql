-- Backfill vendor_id for TWC materials that are missing it
-- Links to the same TWC vendor as the parent product

WITH twc_vendors AS (
  -- Get each user's TWC vendor
  SELECT user_id, id as vendor_id
  FROM vendors 
  WHERE name ILIKE '%TWC%'
)
UPDATE enhanced_inventory_items eii
SET vendor_id = tv.vendor_id
FROM twc_vendors tv
WHERE eii.user_id = tv.user_id
  AND eii.supplier = 'TWC'
  AND eii.vendor_id IS NULL;