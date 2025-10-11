-- Add wallpaper-specific fields to curtain_templates for proper calculation
ALTER TABLE curtain_templates
ADD COLUMN IF NOT EXISTS wallpaper_pattern_repeat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallpaper_roll_width numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallpaper_roll_length numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallpaper_sold_by text DEFAULT 'per_roll' CHECK (wallpaper_sold_by IN ('per_roll', 'per_unit', 'per_sqm')),
ADD COLUMN IF NOT EXISTS wallpaper_unit_of_measure text DEFAULT 'cm' CHECK (wallpaper_unit_of_measure IN ('cm', 'inch', 'mm'));

-- Update the existing wallpaper template with sensible defaults
UPDATE curtain_templates
SET 
  wallpaper_pattern_repeat = 50,
  wallpaper_roll_width = 53,
  wallpaper_roll_length = 1000,
  wallpaper_sold_by = 'per_roll',
  wallpaper_unit_of_measure = 'cm'
WHERE treatment_category = 'wallpaper' AND is_system_default = true;