-- Add wallpaper-specific fields to inventory table
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS wallpaper_roll_width numeric,
ADD COLUMN IF NOT EXISTS wallpaper_roll_length numeric,
ADD COLUMN IF NOT EXISTS wallpaper_sold_by text DEFAULT 'per_roll' CHECK (wallpaper_sold_by IN ('per_roll', 'per_unit', 'per_sqm')),
ADD COLUMN IF NOT EXISTS wallpaper_unit_of_measure text DEFAULT 'cm' CHECK (wallpaper_unit_of_measure IN ('cm', 'inch', 'mm'));

-- Remove wallpaper-specific fields from curtain_templates (they don't belong there)
ALTER TABLE curtain_templates
DROP COLUMN IF EXISTS wallpaper_pattern_repeat,
DROP COLUMN IF EXISTS wallpaper_roll_width,
DROP COLUMN IF EXISTS wallpaper_roll_length,
DROP COLUMN IF EXISTS wallpaper_sold_by,
DROP COLUMN IF EXISTS wallpaper_unit_of_measure;

COMMENT ON COLUMN inventory.wallpaper_roll_width IS 'Width of wallpaper roll (used only for wallpaper category items)';
COMMENT ON COLUMN inventory.wallpaper_roll_length IS 'Length of wallpaper roll (used only for wallpaper category items)';
COMMENT ON COLUMN inventory.wallpaper_sold_by IS 'How wallpaper is sold: per_roll, per_unit, or per_sqm';
COMMENT ON COLUMN inventory.pattern_repeat_vertical IS 'Vertical pattern repeat for fabric/wallpaper';
COMMENT ON COLUMN inventory.pattern_repeat_horizontal IS 'Horizontal pattern repeat for fabric/wallpaper';