-- Fix Angely-Paris account with missing measurement_units
UPDATE business_settings
SET measurement_units = '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}'::text,
    updated_at = now()
WHERE user_id = '50a23348-3817-47ff-bf43-c0d3f3749a6a'
  AND (measurement_units IS NULL OR measurement_units = '');