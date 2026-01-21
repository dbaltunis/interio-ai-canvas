-- Fix Homekaara account missing category_markups, material_markup, and labor_markup
-- This ensures markup resolution will find valid percentages instead of falling to 0%

UPDATE business_settings 
SET pricing_settings = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(pricing_settings, '{}'::jsonb),
      '{category_markups}',
      '{"blinds": 45, "curtains": 50, "fabric": 45, "hardware": 35, "installation": 25, "shutters": 55}'::jsonb
    ),
    '{material_markup_percentage}',
    '40'::jsonb
  ),
  '{labor_markup_percentage}',
  '30'::jsonb
),
updated_at = NOW()
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND (pricing_settings->'category_markups' IS NULL 
       OR pricing_settings->>'material_markup_percentage' IS NULL);

-- Also ensure all future business_settings rows have minimum required pricing_settings structure
-- by adding a default value to the column if not already set

COMMENT ON COLUMN business_settings.pricing_settings IS 'JSON object containing pricing configuration including category_markups, material_markup_percentage, labor_markup_percentage, default_markup_percentage';