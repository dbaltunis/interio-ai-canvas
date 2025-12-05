-- Add pricing_method column to enhanced_inventory_items
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS pricing_method text DEFAULT 'linear';

COMMENT ON COLUMN enhanced_inventory_items.pricing_method IS 
'How this item is priced: linear (per meter/yard), per_sqm (per square meter/foot), grid (use pricing grid), fixed (flat price)';