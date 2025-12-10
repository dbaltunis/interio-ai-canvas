-- Fix existing accounts with NULL or incomplete business_settings
-- This ensures all accounts work consistently

-- Update accounts that have NULL measurement_units
UPDATE business_settings
SET measurement_units = '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}'
WHERE measurement_units IS NULL;

-- Update accounts that have NULL tax_type  
UPDATE business_settings
SET tax_type = 'none'
WHERE tax_type IS NULL;

-- Update accounts that have NULL tax_rate
UPDATE business_settings
SET tax_rate = 0
WHERE tax_rate IS NULL;

-- Update accounts that have NULL pricing_settings
UPDATE business_settings
SET pricing_settings = '{"tax_inclusive": false, "default_markup_percentage": 50}'::jsonb
WHERE pricing_settings IS NULL;

-- Report how many were fixed
SELECT 
  COUNT(*) as total_accounts,
  COUNT(CASE WHEN measurement_units IS NOT NULL THEN 1 END) as has_measurement_units,
  COUNT(CASE WHEN tax_type IS NOT NULL THEN 1 END) as has_tax_type,
  COUNT(CASE WHEN tax_rate IS NOT NULL THEN 1 END) as has_tax_rate,
  COUNT(CASE WHEN pricing_settings IS NOT NULL THEN 1 END) as has_pricing_settings
FROM business_settings;