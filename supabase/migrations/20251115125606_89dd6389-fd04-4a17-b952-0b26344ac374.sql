-- Add hierarchical pricing support to treatment options system (corrected table names)

-- Add pricing fields to option_categories (category level pricing)
ALTER TABLE _legacy_option_categories 
ADD COLUMN IF NOT EXISTS pricing_method TEXT,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pricing_grid_data JSONB,
ADD COLUMN IF NOT EXISTS pricing_grid_type TEXT CHECK (pricing_grid_type IN ('width', 'drop', 'matrix'));

-- Add pricing fields to option_subcategories (subcategory level pricing)
ALTER TABLE _legacy_option_subcategories
ADD COLUMN IF NOT EXISTS pricing_grid_data JSONB,
ADD COLUMN IF NOT EXISTS pricing_grid_type TEXT CHECK (pricing_grid_type IN ('width', 'drop', 'matrix'));

-- Add pricing fields to option_sub_subcategories (sub-subcategory level pricing)  
ALTER TABLE _legacy_option_sub_subcategories
ADD COLUMN IF NOT EXISTS pricing_grid_data JSONB,
ADD COLUMN IF NOT EXISTS pricing_grid_type TEXT CHECK (pricing_grid_type IN ('width', 'drop', 'matrix'));

-- Add pricing fields to treatment_options table
ALTER TABLE treatment_options
ADD COLUMN IF NOT EXISTS pricing_method TEXT,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pricing_grid_data JSONB,
ADD COLUMN IF NOT EXISTS pricing_grid_type TEXT CHECK (pricing_grid_type IN ('width', 'drop', 'matrix'));

-- Add pricing fields to option_values table  
ALTER TABLE option_values
ADD COLUMN IF NOT EXISTS pricing_method TEXT,
ADD COLUMN IF NOT EXISTS pricing_grid_data JSONB,
ADD COLUMN IF NOT EXISTS pricing_grid_type TEXT CHECK (pricing_grid_type IN ('width', 'drop', 'matrix'));

-- Create index for faster pricing grid lookups
CREATE INDEX IF NOT EXISTS idx_option_categories_pricing ON _legacy_option_categories(pricing_method) WHERE pricing_method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_option_subcategories_pricing ON _legacy_option_subcategories(pricing_method) WHERE pricing_method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_options_pricing ON treatment_options(pricing_method) WHERE pricing_method IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN _legacy_option_categories.pricing_method IS 'Pricing method at category level: fixed, per-unit, per-item, per-linear-meter, per-sqm, percentage, pricing-grid';
COMMENT ON COLUMN _legacy_option_categories.pricing_grid_data IS 'JSON array of pricing grid rows with min/max ranges or matrix values';
COMMENT ON COLUMN _legacy_option_categories.pricing_grid_type IS 'Type of pricing grid: width (range), drop (range), or matrix (width×drop)';
