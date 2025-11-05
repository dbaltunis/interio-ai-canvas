-- Add product_category column to enhanced_inventory_items for pricing grid routing
-- This field specifies what type of product this fabric/material is used for
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS product_category text;

-- Add index for faster pricing grid lookups
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_price_routing 
ON enhanced_inventory_items(product_category, price_group, system_type) 
WHERE active = true;

-- Add comment
COMMENT ON COLUMN enhanced_inventory_items.product_category IS 'Product type this item is used for (e.g., roller_blinds, curtains, roman_blinds) - used for pricing grid routing';