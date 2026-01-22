-- Backfill sensible default markup settings for accounts with all-zero configuration
-- This ensures all accounts get proper fallback markups: Default 50%, Material 40%, Labor 30%

UPDATE business_settings
SET pricing_settings = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(pricing_settings, '{}'::jsonb),
      '{material_markup_percentage}',
      '40'
    ),
    '{labor_markup_percentage}',
    '30'
  ),
  '{default_markup_percentage}',
  '50'
),
updated_at = now()
WHERE 
  -- Only update if ALL three key markups are 0 or not set (completely unconfigured accounts)
  (COALESCE((pricing_settings->>'material_markup_percentage')::numeric, 0) = 0
   AND COALESCE((pricing_settings->>'labor_markup_percentage')::numeric, 0) = 0
   AND COALESCE((pricing_settings->>'default_markup_percentage')::numeric, 0) = 0);