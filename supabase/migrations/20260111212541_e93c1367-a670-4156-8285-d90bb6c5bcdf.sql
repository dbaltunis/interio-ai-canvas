
-- HOMEKAARA FINAL ITEMS - Only missing pieces

-- 1. Steel Chain Length Options (missing)
INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
VALUES 
  (gen_random_uuid(), '33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'Standard Steel 2.4m', 'steel_standard_2_4m', 4, '{"price": 500, "pricing_method": "fixed", "chain_type": "steel"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'Medium Steel 4.0m', 'steel_medium_4m', 5, '{"price": 800, "pricing_method": "fixed", "chain_type": "steel"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'Long Steel 6.0m', 'steel_long_6m', 6, '{"price": 1100, "pricing_method": "fixed", "chain_type": "steel"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'Extra Long Steel 8.0m', 'steel_extra_long_8m', 7, '{"price": 1400, "pricing_method": "fixed", "chain_type": "steel"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- 2. Twin with Sheer Headrail (missing)
INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
VALUES (
  gen_random_uuid(), 
  '2c470879-e9ce-418d-b561-290abea53211', 
  'Twin with Sheer Headrail', 
  'twin_sheer_headrail', 
  5, 
  '{"price": 2950, "pricing_method": "per_running_foot", "min_width_rft": 6, "rounding_interval": 0.5}'::jsonb, 
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'
);

-- 3. Making Charges Option
INSERT INTO treatment_options (id, account_id, treatment_category, key, label, input_type, required, order_index, base_price, pricing_method)
VALUES (
  gen_random_uuid(),
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'roman_blinds',
  'making_charges',
  'Making Charges',
  'number',
  true,
  1,
  360,
  'per_sqft'
);

-- 4. Making Charges Values
INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
SELECT 
  gen_random_uuid(), to2.id, 'Roman Blind Making', 'roman_making', 1,
  '{"price": 360, "pricing_method": "per_sqft", "min_sqft": 16, "auto_add": true}'::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'
FROM treatment_options to2
WHERE to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to2.key = 'making_charges' AND to2.treatment_category = 'roman_blinds';

INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
SELECT 
  gen_random_uuid(), to2.id, 'Aluminium Pipe', 'aluminium_pipe', 2,
  '{"price": 26, "pricing_method": "per_running_foot", "auto_add": true}'::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'
FROM treatment_options to2
WHERE to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to2.key = 'making_charges' AND to2.treatment_category = 'roman_blinds';

INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
SELECT 
  gen_random_uuid(), to2.id, 'Aluminium Flats (3mm)', 'aluminium_flats', 3,
  '{"price": 200, "pricing_method": "per_running_foot", "auto_add": true}'::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'
FROM treatment_options to2
WHERE to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to2.key = 'making_charges' AND to2.treatment_category = 'roman_blinds';

-- 5. Packaging Value (packaging option exists, just add value)
INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
VALUES (
  gen_random_uuid(),
  'ca219960-4b6f-4e3e-b259-0b3ef92f14aa',
  'Standard Packaging',
  'standard',
  1,
  '{"price": 200, "pricing_method": "per_blind", "auto_add": true}'::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'
);
