-- Fix Venetian Blinds material option that has wrong configuration

-- Update the existing venetian_blinds material option
UPDATE treatment_options
SET 
  tracks_inventory = true,
  pricing_method = 'per-sqm',
  label = 'Material'
WHERE treatment_category = 'venetian_blinds'
  AND key = 'material'
  AND template_id IS NULL
  AND (tracks_inventory = false OR pricing_method IS NULL OR label = 'Materials');

-- Ensure all existing material option values have correct pricing_method in extra_data
UPDATE option_values
SET extra_data = jsonb_set(
  COALESCE(extra_data, '{}'::jsonb),
  '{pricing_method}',
  '"per-sqm"'
)
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE treatment_category = 'venetian_blinds'
    AND key = 'material'
    AND template_id IS NULL
)
AND (extra_data IS NULL OR extra_data->>'pricing_method' IS NULL);