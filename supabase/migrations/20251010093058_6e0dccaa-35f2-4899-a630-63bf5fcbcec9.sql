-- Delete ALL roller_blinds options and start fresh
DELETE FROM option_values 
WHERE option_id IN (
  SELECT id FROM treatment_options WHERE treatment_category = 'roller_blinds'
);

DELETE FROM treatment_options 
WHERE treatment_category = 'roller_blinds';

-- Create clean category-based options for roller blinds
INSERT INTO treatment_options (key, label, input_type, treatment_category, required, visible, order_index, is_system_default, template_id)
VALUES 
  ('bracket_type', 'Bracket Types', 'select', 'roller_blinds', false, true, 1, false, NULL);

-- Get the option ID we just created
DO $$
DECLARE
  bracket_option_id UUID;
BEGIN
  SELECT id INTO bracket_option_id 
  FROM treatment_options 
  WHERE treatment_category = 'roller_blinds' AND key = 'bracket_type'
  LIMIT 1;
  
  -- Add default bracket values
  INSERT INTO option_values (option_id, code, label, order_index, extra_data)
  VALUES 
    (bracket_option_id, 'standard', 'Standard Brackets', 0, '{"price": 0}'),
    (bracket_option_id, 'heavy_duty', 'Heavy Duty Brackets', 1, '{"price": 15}');
END $$;