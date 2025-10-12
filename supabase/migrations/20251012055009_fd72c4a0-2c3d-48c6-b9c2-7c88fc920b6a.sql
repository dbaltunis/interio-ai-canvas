-- Add wallpaper-specific columns to enhanced_inventory_items table
ALTER TABLE enhanced_inventory_items
ADD COLUMN IF NOT EXISTS wallpaper_roll_length numeric,
ADD COLUMN IF NOT EXISTS wallpaper_roll_width numeric,
ADD COLUMN IF NOT EXISTS wallpaper_sold_by text,
ADD COLUMN IF NOT EXISTS wallpaper_unit_of_measure text;

-- Add comment to explain the columns
COMMENT ON COLUMN enhanced_inventory_items.wallpaper_roll_length IS 'Length of wallpaper roll in the specified unit';
COMMENT ON COLUMN enhanced_inventory_items.wallpaper_roll_width IS 'Width of wallpaper roll in the specified unit';
COMMENT ON COLUMN enhanced_inventory_items.wallpaper_sold_by IS 'How wallpaper is sold (e.g., roll, meter, square meter)';
COMMENT ON COLUMN enhanced_inventory_items.wallpaper_unit_of_measure IS 'Unit of measurement for wallpaper (e.g., meters, feet)';