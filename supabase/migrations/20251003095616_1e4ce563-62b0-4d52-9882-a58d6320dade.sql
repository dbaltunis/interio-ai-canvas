-- Phase 1: Clean up and optimize enhanced_inventory_items table

-- 1. Drop unit_price column (redundant and confusing)
ALTER TABLE enhanced_inventory_items 
DROP COLUMN IF EXISTS unit_price;

-- 2. Ensure cost_price and selling_price are NOT NULL with sensible defaults
ALTER TABLE enhanced_inventory_items 
ALTER COLUMN cost_price SET DEFAULT 0,
ALTER COLUMN cost_price SET NOT NULL,
ALTER COLUMN selling_price SET DEFAULT 0,
ALTER COLUMN selling_price SET NOT NULL;

-- 3. Add calculated columns for profit analysis
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS profit_per_unit NUMERIC GENERATED ALWAYS AS (selling_price - cost_price) STORED,
ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN cost_price > 0 THEN ROUND(((selling_price - cost_price) / cost_price) * 100, 2)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN selling_price > 0 THEN ROUND(((selling_price - cost_price) / selling_price) * 100, 2)
    ELSE 0
  END
) STORED;

-- 4. Add foreign key for vendor with proper constraint
ALTER TABLE enhanced_inventory_items 
DROP CONSTRAINT IF EXISTS fk_enhanced_inventory_vendor;

ALTER TABLE enhanced_inventory_items 
ADD CONSTRAINT fk_enhanced_inventory_vendor 
FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_vendor ON enhanced_inventory_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_category ON enhanced_inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_user ON enhanced_inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_active ON enhanced_inventory_items(active) WHERE active = true;

-- 6. Add comment for clarity
COMMENT ON COLUMN enhanced_inventory_items.cost_price IS 'Price paid to supplier per unit';
COMMENT ON COLUMN enhanced_inventory_items.selling_price IS 'Price charged to customer per unit';
COMMENT ON COLUMN enhanced_inventory_items.profit_per_unit IS 'Calculated: selling_price - cost_price';
COMMENT ON COLUMN enhanced_inventory_items.markup_percentage IS 'Calculated: ((selling - cost) / cost) × 100';
COMMENT ON COLUMN enhanced_inventory_items.margin_percentage IS 'Calculated: ((selling - cost) / selling) × 100';