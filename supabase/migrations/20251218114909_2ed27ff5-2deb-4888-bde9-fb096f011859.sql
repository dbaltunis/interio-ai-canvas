-- Backfill existing TWC materials with vendor_id
-- This links existing materials with supplier='TWC' to the proper vendor record

UPDATE enhanced_inventory_items ei
SET vendor_id = v.id
FROM vendors v
WHERE ei.supplier = 'TWC' 
  AND ei.vendor_id IS NULL
  AND v.name ILIKE '%TWC%'
  AND ei.user_id = v.user_id;