-- Add markup_percentage column to pricing_grids table
ALTER TABLE pricing_grids 
ADD COLUMN IF NOT EXISTS markup_percentage numeric DEFAULT 0;

-- Add cost/selling/margin columns to windows_summary for proper tracking
ALTER TABLE windows_summary 
ADD COLUMN IF NOT EXISTS cost_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS selling_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS markup_applied numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_margin numeric DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN pricing_grids.markup_percentage IS 'Default markup percentage for this pricing grid. Falls back to category/global markup if 0.';
COMMENT ON COLUMN windows_summary.cost_total IS 'Base cost before any markup';
COMMENT ON COLUMN windows_summary.selling_total IS 'Selling price after markup applied';
COMMENT ON COLUMN windows_summary.markup_applied IS 'Markup percentage that was applied';
COMMENT ON COLUMN windows_summary.profit_margin IS 'Gross profit margin percentage (selling - cost) / selling × 100';