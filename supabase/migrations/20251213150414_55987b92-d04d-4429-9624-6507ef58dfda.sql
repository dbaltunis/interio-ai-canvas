-- Add supplier and product type columns to pricing_grids for auto-matching
-- This enables: Supplier + Product Type + Price Group = Auto-matched Grid

ALTER TABLE pricing_grids 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS price_group TEXT;

-- Add index for efficient lookup during auto-matching
CREATE INDEX IF NOT EXISTS idx_pricing_grids_auto_match 
ON pricing_grids(supplier_id, product_type, price_group) 
WHERE active = true;

-- Add comment explaining the auto-matching system
COMMENT ON COLUMN pricing_grids.supplier_id IS 'Supplier/vendor who provides this pricing grid';
COMMENT ON COLUMN pricing_grids.product_type IS 'Product type this grid applies to: roller_blinds, venetian_blinds, cellular_blinds, vertical_blinds, shutters, awnings, panel_glide';
COMMENT ON COLUMN pricing_grids.price_group IS 'Price group code (e.g., A, B, C, 1, 2, GROUP-A) - matches with fabric/material price_group for auto-matching';