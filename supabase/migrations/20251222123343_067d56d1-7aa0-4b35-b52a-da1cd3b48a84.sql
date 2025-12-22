-- Fix fabric_width values that are stored in inches (need conversion to CM)
-- Common fabric widths in inches: 36, 44, 45, 54, 60, 90, 108, 118, 120
-- These should be converted to CM (multiply by 2.54)

-- Update fabric_width values that appear to be in inches (under 130 and matching common inch widths)
UPDATE enhanced_inventory_items 
SET fabric_width = fabric_width * 2.54,
    updated_at = NOW()
WHERE (category = 'fabric' OR subcategory ILIKE '%fabric%')
  AND fabric_width IS NOT NULL
  AND fabric_width > 0
  AND fabric_width < 130  -- Values under 130 are likely inches, not CM
  AND fabric_width IN (36, 44, 45, 54, 60, 90, 108, 118, 120);  -- Common inch widths

-- Log what was updated for debugging
-- After migration, all fabric_width values should be in CM (typically 90-320cm)