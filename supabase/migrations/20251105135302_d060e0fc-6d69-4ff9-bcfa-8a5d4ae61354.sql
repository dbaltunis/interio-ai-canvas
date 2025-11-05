-- Add markup_percentage column to pricing_grids table
ALTER TABLE pricing_grids 
ADD COLUMN IF NOT EXISTS markup_percentage numeric DEFAULT 0 CHECK (markup_percentage >= 0 AND markup_percentage <= 1000);

COMMENT ON COLUMN pricing_grids.markup_percentage IS 'Profit markup percentage for this pricing grid (e.g., 40 = 40% markup)';