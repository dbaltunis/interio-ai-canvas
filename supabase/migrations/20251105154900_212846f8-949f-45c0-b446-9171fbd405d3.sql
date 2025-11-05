
-- CRITICAL: Delete test/ghost options and their values
-- These are test data that should never have been in production

-- Step 1: Delete the option values for test options
DELETE FROM option_values 
WHERE id IN (
  '17c709a3-7650-4627-80fb-cab16dd51c26',  -- edfv (testing option)
  '7c1416d0-c969-4b24-baae-b7c821e62882',  -- sdcx (sdcx option)
  'dd3010d4-2824-4699-8d41-8bc80ca84401'   -- qwecf (motor_type option)
);

-- Step 2: Delete the test options themselves
DELETE FROM treatment_options 
WHERE id IN (
  '39d627b0-c89e-43fa-bae1-2c74aed411cc',  -- testing option
  '6ec98762-7e22-45d3-9687-a4bb0d533e75'   -- sdcx option
);

-- Log what was deleted
DO $$
BEGIN
  RAISE NOTICE 'Deleted test options: testing, sdcx, and qwecf value from motor_type';
END $$;
