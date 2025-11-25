-- Add pricing_grid_id to enhanced_inventory_items for direct grid assignment
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS pricing_grid_id UUID REFERENCES pricing_grids(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_pricing_grid ON enhanced_inventory_items(pricing_grid_id);

-- Add comment explaining the direct assignment approach
COMMENT ON COLUMN enhanced_inventory_items.pricing_grid_id IS 'Direct assignment of pricing grid to this inventory item. Simpler than routing rules - when this fabric/material is selected, use this grid for pricing.';