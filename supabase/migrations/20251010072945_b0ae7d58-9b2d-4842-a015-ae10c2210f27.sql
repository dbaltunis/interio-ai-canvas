-- Fix existing option_values with empty extra_data
UPDATE option_values
SET extra_data = '{"price": 0}'::jsonb
WHERE extra_data IS NULL OR extra_data = '{}'::jsonb OR extra_data = 'null'::jsonb;