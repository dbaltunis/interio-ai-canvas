-- Phase 1: Link existing Roman Blind options to template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT 
  '844faed0-092f-4528-b5fc-4a17d37fddfa'::uuid,
  id,
  true,
  order_index
FROM treatment_options
WHERE account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
AND treatment_category = 'roman_blinds'
ON CONFLICT ON CONSTRAINT template_option_settings_template_id_treatment_option_id_key DO NOTHING;

-- Phase 2: Create Roller Blind treatment options for Homekaara
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, base_price, order_index, required, visible)
VALUES 
  ('control_type', 'Control Type', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 1, true, true),
  ('roll_direction', 'Roll Direction', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 2, false, true),
  ('bracket_type', 'Bracket Type', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 3, false, true),
  ('bottom_bar', 'Bottom Bar', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 4, false, true),
  ('chain_side', 'Chain Side', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 5, false, true),
  ('roller_chain_length', 'Chain Length', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 6, false, true),
  ('roller_motor_type', 'Motor Type', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 0, 7, false, true),
  ('roller_installation', 'Installation', 'select', 'roller_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 500, 8, false, true)
ON CONFLICT ON CONSTRAINT treatment_options_account_category_key_unique DO NOTHING;

-- Create option values for Roller Blind options
-- Control Type values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Chain', 'chain', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'control_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Spring', 'spring', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'control_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Motorised', 'motorised', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'control_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Roll Direction values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Standard (Behind)', 'standard', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roll_direction' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Reverse (In Front)', 'reverse', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roll_direction' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Bracket Type values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Face Fix', 'face_fix', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bracket_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Top Fix', 'top_fix', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bracket_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Universal', 'universal', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bracket_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Bottom Bar values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Standard', 'standard', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bottom_bar' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Weighted', 'weighted', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bottom_bar' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Fabric Wrapped', 'fabric_wrapped', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'bottom_bar' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Chain Side values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Left', 'left', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'chain_side' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Right', 'right', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'chain_side' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Chain Length values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Standard 1.5m', 'standard_1.5m', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_chain_length' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Extended 2m', 'extended_2m', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_chain_length' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Long 3m', 'long_3m', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_chain_length' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Motor Type values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Battery (₹15,000)', 'battery', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_motor_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Hardwired (₹20,000)', 'hardwired', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_motor_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Solar (₹25,000)', 'solar', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_motor_type' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Installation values
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Standard (₹500)', 'standard', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_installation' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';
INSERT INTO option_values (option_id, label, code, order_index, account_id)
SELECT id, 'Motorised (₹1,500)', 'motorised', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991' FROM treatment_options WHERE key = 'roller_installation' AND account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' AND treatment_category = 'roller_blinds';

-- Link Roller Blind options to Roller Blinds template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT 
  '65336f71-d16c-464b-8266-34bb797b5d69'::uuid,
  id,
  true,
  order_index
FROM treatment_options
WHERE account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
AND treatment_category = 'roller_blinds'
ON CONFLICT ON CONSTRAINT template_option_settings_template_id_treatment_option_id_key DO NOTHING;

-- Link Roller Blind options to Zebra/Dual Blinds template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT 
  'fe9d007c-46ec-4960-adfd-6f3038d63c1c'::uuid,
  id,
  true,
  order_index
FROM treatment_options
WHERE account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
AND treatment_category = 'roller_blinds'
ON CONFLICT ON CONSTRAINT template_option_settings_template_id_treatment_option_id_key DO NOTHING;