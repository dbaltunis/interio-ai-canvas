-- Migration: Convert existing measurement data from CM to MM
-- This fixes historical data that was incorrectly stored in CM instead of MM
-- SAFETY: Only converts values < 500 (likely CM values, not MM)

UPDATE windows_summary 
SET 
  rail_width = rail_width * 10,
  drop = drop * 10
WHERE rail_width IS NOT NULL 
  AND rail_width < 500  -- Safety check: only convert small values that are likely in CM
  AND rail_width > 0;

-- Add comment for documentation
COMMENT ON COLUMN windows_summary.rail_width IS 'Rail width in millimeters (MM) - database standard';
COMMENT ON COLUMN windows_summary.drop IS 'Drop/height in millimeters (MM) - database standard';