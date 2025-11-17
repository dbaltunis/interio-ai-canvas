-- Fix venetian blinds material option values

-- Delete the duplicate/typo entry
DELETE FROM option_values
WHERE code = 'aliuminium'
  AND option_id IN (
    SELECT id FROM treatment_options 
    WHERE treatment_category = 'venetian_blinds' 
    AND key = 'material'
    AND template_id IS NULL
  );

-- Update existing aluminum, wood, and faux_wood entries to use per-sqm pricing
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
AND code IN ('aluminum', 'wood', 'faux_wood')
AND (extra_data->>'pricing_method' != 'per-sqm' OR extra_data->>'pricing_method' IS NULL);