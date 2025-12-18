-- Clean up accumulated generic options that have too many values
-- This removes options that have accumulated 40+ values from multiple TWC syncs

-- Step 1: Delete option_values for generic options with excessive values
DELETE FROM option_values
WHERE option_id IN (
  SELECT o.id
  FROM treatment_options o
  WHERE o.key IN ('control_type', 'remote', 'base_rail_colour', 'bottom_rail_colour', 
                  'cassette_colour', 'chain_colour', 'fascia_colour', 'head_rail_colour',
                  'head_rail_finish', 'motor_type', 'operation_side', 'chain_type',
                  'cassette_type', 'valance_colour', 'bottom_bar_colour', 'drive_mechanism')
    AND o.key NOT LIKE '%_%_%'  -- Only delete simple keys without template suffix (e.g. control_type_abc12345)
);

-- Step 2: Delete template_option_settings for these generic options (uses treatment_option_id)
DELETE FROM template_option_settings
WHERE treatment_option_id IN (
  SELECT o.id
  FROM treatment_options o
  WHERE o.key IN ('control_type', 'remote', 'base_rail_colour', 'bottom_rail_colour', 
                  'cassette_colour', 'chain_colour', 'fascia_colour', 'head_rail_colour',
                  'head_rail_finish', 'motor_type', 'operation_side', 'chain_type',
                  'cassette_type', 'valance_colour', 'bottom_bar_colour', 'drive_mechanism')
    AND o.key NOT LIKE '%_%_%'
);

-- Step 3: Delete the generic options themselves
DELETE FROM treatment_options
WHERE key IN ('control_type', 'remote', 'base_rail_colour', 'bottom_rail_colour', 
              'cassette_colour', 'chain_colour', 'fascia_colour', 'head_rail_colour',
              'head_rail_finish', 'motor_type', 'operation_side', 'chain_type',
              'cassette_type', 'valance_colour', 'bottom_bar_colour', 'drive_mechanism')
  AND key NOT LIKE '%_%_%';

-- Step 4: Delete heading_type options (headings now handled via Heading tab)
DELETE FROM option_values
WHERE option_id IN (SELECT id FROM treatment_options WHERE key = 'heading_type');

DELETE FROM template_option_settings
WHERE treatment_option_id IN (SELECT id FROM treatment_options WHERE key = 'heading_type');

DELETE FROM treatment_options WHERE key = 'heading_type';

-- Step 5: Clean up orphaned option_values
DELETE FROM option_values
WHERE option_id NOT IN (SELECT id FROM treatment_options);

-- Step 6: Clean up orphaned template_option_settings
DELETE FROM template_option_settings
WHERE treatment_option_id NOT IN (SELECT id FROM treatment_options);