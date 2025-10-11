-- Add wallpaper-specific columns to enhanced_inventory_items table
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS roll_width_cm numeric,
ADD COLUMN IF NOT EXISTS roll_length_cm numeric,
ADD COLUMN IF NOT EXISTS pattern_repeat_cm numeric,
ADD COLUMN IF NOT EXISTS coverage_per_roll numeric,
ADD COLUMN IF NOT EXISTS sold_by_unit text DEFAULT 'per_roll';

-- Add check constraint for sold_by_unit values
ALTER TABLE enhanced_inventory_items
ADD CONSTRAINT sold_by_unit_check 
CHECK (sold_by_unit IS NULL OR sold_by_unit IN ('per_roll', 'per_meter', 'per_sqm', 'per_unit'));

-- Create index for wallpaper inventory filtering
CREATE INDEX IF NOT EXISTS idx_inventory_wallpaper 
ON enhanced_inventory_items(category) 
WHERE category = 'wallpaper';

-- Create index for curtain templates treatment category filtering
CREATE INDEX IF NOT EXISTS idx_templates_treatment_category 
ON curtain_templates(treatment_category) 
WHERE treatment_category IS NOT NULL;

-- Add documentation comments
COMMENT ON COLUMN enhanced_inventory_items.roll_width_cm IS 'Width of wallpaper roll in centimeters';
COMMENT ON COLUMN enhanced_inventory_items.roll_length_cm IS 'Length of wallpaper roll in centimeters';
COMMENT ON COLUMN enhanced_inventory_items.pattern_repeat_cm IS 'Pattern repeat distance in centimeters for wallpaper matching';
COMMENT ON COLUMN enhanced_inventory_items.coverage_per_roll IS 'Coverage area per roll in square meters';
COMMENT ON COLUMN enhanced_inventory_items.sold_by_unit IS 'How wallpaper is sold: per_roll, per_meter, per_sqm, or per_unit';