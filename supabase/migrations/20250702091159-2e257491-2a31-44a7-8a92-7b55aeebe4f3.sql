-- Add new columns to window_covering_option_categories table
ALTER TABLE window_covering_option_categories 
ADD COLUMN category_type text,
ADD COLUMN has_fullness_ratio boolean DEFAULT false,
ADD COLUMN fullness_ratio numeric,
ADD COLUMN calculation_method text DEFAULT 'per-unit';

-- Update existing records to have default values
UPDATE window_covering_option_categories 
SET category_type = 'general', 
    calculation_method = 'per-unit' 
WHERE category_type IS NULL;