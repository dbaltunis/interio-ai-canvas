-- Add discount_percentage column to pricing_grids
-- This represents the trade/supplier discount applied to the grid's list prices
-- Flow: grid_list_price × (1 - discount/100) = effective_cost, then markup is applied on effective_cost
ALTER TABLE pricing_grids
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN pricing_grids.discount_percentage IS 'Trade/supplier discount percentage. Applied to grid list prices to get effective cost before markup.';
