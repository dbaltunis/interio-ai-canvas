-- Delete duplicate heading records created on Dec 1 (keeping original older ones)
DELETE FROM enhanced_inventory_items 
WHERE id IN (
  '300e6274-7c69-4a96-9d8c-1074de06752c',  -- eyelet pleat duplicate
  '79105db5-f74d-4f40-bcbf-3863c4927867',  -- pencil pleat duplicate
  'dc312b5a-e17f-47b2-8fbe-ccffc485a118'   -- Pinch pleat duplicate
);