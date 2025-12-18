-- Clean up ALL accumulated generic options (those without product-specific suffix)

-- Step 1: Delete option_values for generic options
DELETE FROM option_values 
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE key IN (
    'control_type', 'remote', 'base_rail_colour', 'heading_type', 'motor',
    'bottom_rail', 'fabric_edge', 'chain_colour', 'bracket_type', 'roll_direction',
    'valance', 'cassette', 'fascia', 'side_channels', 'light_gap'
  )
  AND key NOT LIKE '%________'
);

-- Step 2: Delete template_option_settings for generic options
DELETE FROM template_option_settings 
WHERE treatment_option_id IN (
  SELECT id FROM treatment_options 
  WHERE key IN (
    'control_type', 'remote', 'base_rail_colour', 'heading_type', 'motor',
    'bottom_rail', 'fabric_edge', 'chain_colour', 'bracket_type', 'roll_direction',
    'valance', 'cassette', 'fascia', 'side_channels', 'light_gap'
  )
  AND key NOT LIKE '%________'
);

-- Step 3: Delete the generic treatment_options themselves
DELETE FROM treatment_options 
WHERE key IN (
  'control_type', 'remote', 'base_rail_colour', 'heading_type', 'motor',
  'bottom_rail', 'fabric_edge', 'chain_colour', 'bracket_type', 'roll_direction',
  'valance', 'cassette', 'fascia', 'side_channels', 'light_gap'
)
AND key NOT LIKE '%________';

-- Step 4: Also clean up any option with 40+ values (accumulated from multiple products)
WITH bloated_options AS (
  SELECT option_id 
  FROM option_values 
  GROUP BY option_id 
  HAVING COUNT(*) > 40
)
DELETE FROM option_values WHERE option_id IN (SELECT option_id FROM bloated_options);

-- Clean orphaned treatment_options with no values left
DELETE FROM treatment_options 
WHERE id NOT IN (SELECT DISTINCT option_id FROM option_values WHERE option_id IS NOT NULL);