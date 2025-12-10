-- Fix measurement_units for the current user to use MM as internal standard
UPDATE business_settings 
SET measurement_units = '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"EUR"}'
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- Return the updated settings
SELECT user_id, measurement_units FROM business_settings 
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';