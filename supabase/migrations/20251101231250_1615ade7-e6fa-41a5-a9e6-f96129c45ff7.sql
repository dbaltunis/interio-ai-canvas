
-- Phase 3 & 4: Clean up duplicates and fix markup visibility

-- 1. Keep only the most recent business_settings per user
WITH ranked_settings AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM business_settings
)
DELETE FROM business_settings
WHERE id IN (
  SELECT id FROM ranked_settings WHERE rn > 1
);

-- 2. Ensure pricing_settings has show_markup_to_staff field
UPDATE business_settings
SET pricing_settings = 
  CASE 
    WHEN pricing_settings IS NULL THEN 
      '{"show_markup_to_staff": false}'::jsonb
    WHEN NOT (pricing_settings ? 'show_markup_to_staff') THEN
      pricing_settings || '{"show_markup_to_staff": false}'::jsonb
    ELSE 
      pricing_settings
  END
WHERE pricing_settings IS NULL 
   OR NOT (pricing_settings ? 'show_markup_to_staff');

-- 3. Comment on the settings
COMMENT ON COLUMN business_settings.show_vendor_costs_to_managers IS 
  'When true, users with Manager role can see vendor cost prices in Material Queue and Batch Orders';
  
COMMENT ON COLUMN business_settings.show_vendor_costs_to_staff IS 
  'When true, users with Staff/User role can see vendor cost prices in Material Queue and Batch Orders';
  
COMMENT ON COLUMN business_settings.pricing_settings IS 
  'JSON object containing markup percentages and show_markup_to_staff boolean for controlling markup visibility';
