-- Add wallpaper-specific calculation fields to enhanced_inventory_items
ALTER TABLE public.enhanced_inventory_items
ADD COLUMN IF NOT EXISTS wallpaper_match_type text CHECK (wallpaper_match_type IN ('straight', 'drop', 'offset', 'random', 'none')),
ADD COLUMN IF NOT EXISTS wallpaper_horizontal_repeat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallpaper_waste_factor numeric DEFAULT 10 CHECK (wallpaper_waste_factor >= 0 AND wallpaper_waste_factor <= 100),
ADD COLUMN IF NOT EXISTS wallpaper_pattern_offset numeric DEFAULT 0;

COMMENT ON COLUMN public.enhanced_inventory_items.wallpaper_match_type IS 'Type of pattern matching: straight, drop, offset, random, or none';
COMMENT ON COLUMN public.enhanced_inventory_items.wallpaper_horizontal_repeat IS 'Horizontal pattern repeat in cm (for drop/offset match)';
COMMENT ON COLUMN public.enhanced_inventory_items.wallpaper_waste_factor IS 'Waste factor percentage (typically 10-15%)';
COMMENT ON COLUMN public.enhanced_inventory_items.wallpaper_pattern_offset IS 'Pattern offset for drop match calculations in cm';