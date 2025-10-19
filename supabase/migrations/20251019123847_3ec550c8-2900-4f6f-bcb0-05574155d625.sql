-- Phase 1: Add Missing Columns to windows_summary table for Complete Data Persistence

-- Add options_cost column to track total cost of selected options
ALTER TABLE windows_summary 
ADD COLUMN IF NOT EXISTS options_cost numeric DEFAULT 0;

-- Add hardware_cost column to track hardware/track costs
ALTER TABLE windows_summary
ADD COLUMN IF NOT EXISTS hardware_cost numeric DEFAULT 0;

-- Add selected_options column as JSONB array to store all selected options
ALTER TABLE windows_summary
ADD COLUMN IF NOT EXISTS selected_options jsonb DEFAULT '[]'::jsonb;

-- Add heading_cost column to track heading/header costs
ALTER TABLE windows_summary
ADD COLUMN IF NOT EXISTS heading_cost numeric DEFAULT 0;

-- Add rail_width column for easier querying of dimensions
ALTER TABLE windows_summary
ADD COLUMN IF NOT EXISTS rail_width numeric;

-- Add drop column for easier querying of dimensions
ALTER TABLE windows_summary  
ADD COLUMN IF NOT EXISTS drop numeric;

-- Create index for faster treatment category queries
CREATE INDEX IF NOT EXISTS idx_windows_summary_treatment_category 
ON windows_summary(treatment_category);

-- Add comment explaining the selected_options column structure
COMMENT ON COLUMN windows_summary.selected_options IS 'JSONB array of selected treatment options with name, price, and other details';