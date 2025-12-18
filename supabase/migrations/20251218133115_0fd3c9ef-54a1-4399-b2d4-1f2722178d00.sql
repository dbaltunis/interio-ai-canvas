-- Clean up ALL generic TWC options that don't have product-specific suffix
-- These are the merged options with 79+ values that need to be deleted
-- Product-specific options have keys like 'control_type_a1b2c3d4' (8 char suffix)

-- Step 1: Delete option_values for generic TWC options
DELETE FROM option_values 
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE source = 'twc'
  AND key !~ '_[a-f0-9]{8}$'
);

-- Step 2: Delete template_option_settings for generic TWC options  
DELETE FROM template_option_settings 
WHERE treatment_option_id IN (
  SELECT id FROM treatment_options 
  WHERE source = 'twc'
  AND key !~ '_[a-f0-9]{8}$'
);

-- Step 3: Delete the generic treatment_options themselves
DELETE FROM treatment_options 
WHERE source = 'twc'
AND key !~ '_[a-f0-9]{8}$';