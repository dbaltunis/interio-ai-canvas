-- Add treatment_type field to enhanced_inventory_items for filtering headings by treatment
ALTER TABLE enhanced_inventory_items 
ADD COLUMN treatment_type text;

-- Add comment to explain usage
COMMENT ON COLUMN enhanced_inventory_items.treatment_type IS 'Used to filter items by treatment type: curtain, roller_blind, venetian_blind, roman_blind, plantation_shutter, etc.';

-- Add treatment_type field to option_categories for filtering options by treatment
ALTER TABLE option_categories 
ADD COLUMN treatment_type text;

-- Add comment to explain usage
COMMENT ON COLUMN option_categories.treatment_type IS 'Used to filter option categories by treatment type: curtain, roller_blind, venetian_blind, roman_blind, plantation_shutter, etc. NULL means available for all treatments.';