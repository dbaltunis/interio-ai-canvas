-- Remove the old restrictive check constraint on price_group
ALTER TABLE enhanced_inventory_items 
DROP CONSTRAINT IF EXISTS enhanced_inventory_items_price_group_check;

-- The price_group field should allow any text value or NULL to support custom pricing grid codes
COMMENT ON COLUMN enhanced_inventory_items.price_group IS 'Pricing grid code (e.g., PRICNG_1, A, B, C) - can be NULL if no grid is assigned';