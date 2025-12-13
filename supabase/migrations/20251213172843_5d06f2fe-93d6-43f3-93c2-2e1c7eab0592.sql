-- Phase 3 ONLY: Fix pricing_method for TWC items with price_group
-- (Phase 1 & 2 already partially executed and created conflicts)
UPDATE enhanced_inventory_items
SET pricing_method = 'grid'
WHERE supplier = 'TWC' 
  AND price_group IS NOT NULL 
  AND (pricing_method IS NULL OR pricing_method = 'linear');