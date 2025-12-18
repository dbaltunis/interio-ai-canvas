-- Add includes_fabric_price field to pricing_grids table
-- When TRUE: Grid price is all-inclusive (TWC default - fabric + fabrication)
-- When FALSE: Grid price is fabrication only - fabric cost added separately

ALTER TABLE pricing_grids
ADD COLUMN IF NOT EXISTS includes_fabric_price BOOLEAN NOT NULL DEFAULT TRUE;

-- Add comment explaining the field
COMMENT ON COLUMN pricing_grids.includes_fabric_price IS 'When TRUE (default), grid price includes fabric cost (TWC style). When FALSE, grid price is fabrication only and fabric cost is added separately.';