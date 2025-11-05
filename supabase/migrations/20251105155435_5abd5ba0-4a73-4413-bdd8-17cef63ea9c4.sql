
-- Delete empty motor_type option that has no values
-- This was left behind after deleting its only value (qwecf)

DELETE FROM treatment_options 
WHERE id = '36c6d340-43a8-475f-b170-a957cfe68f76'
  AND key = 'motor_type'
  AND treatment_category = 'roller_blinds';

-- Log the deletion
DO $$
BEGIN
  RAISE NOTICE 'Deleted empty motor_type option for roller_blinds';
END $$;
