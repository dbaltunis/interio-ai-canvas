-- Convert existing fabric_width values that appear to be in inches (< 100) to CM
-- Common inch widths: 36, 44, 45, 48, 54, 60, 108, 118, 120
-- These need to be multiplied by 2.54 to convert to CM
-- Values >= 100 are likely already in CM (e.g., 137.16 cm = 54 inches)

UPDATE enhanced_inventory_items 
SET fabric_width = fabric_width * 2.54,
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"width_converted_from_inches": true}'::jsonb
WHERE fabric_width IS NOT NULL 
  AND fabric_width > 0 
  AND fabric_width < 100
  AND category = 'fabric';