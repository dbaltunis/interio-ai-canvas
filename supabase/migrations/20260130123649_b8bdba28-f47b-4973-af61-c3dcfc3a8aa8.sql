-- Fix remaining 8 track items that are missing compatible_treatments
-- Track/hardware items work with ALL treatment types
UPDATE enhanced_inventory_items
SET 
  compatible_treatments = ARRAY['curtains', 'roman_blinds', 'roller_blinds', 
    'venetian_blinds', 'vertical_blinds', 'panel_glide'],
  pricing_method = 'pricing_grid',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'), 
    '{is_hardware}', 
    'true'
  )
WHERE subcategory = 'track' 
  AND supplier = 'TWC'
  AND (compatible_treatments IS NULL OR compatible_treatments = '{}');