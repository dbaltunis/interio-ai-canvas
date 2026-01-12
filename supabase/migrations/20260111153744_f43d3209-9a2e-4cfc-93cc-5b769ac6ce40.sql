
-- Add bracket type values
INSERT INTO option_values (id, option_id, code, label, extra_data, order_index, pricing_method, account_id) VALUES 
  (gen_random_uuid(), 'f6a2ccb9-56ae-4eb0-96f2-ef9b891a5f31', 'wall_single', 'Wall Bracket (Single)', '{"price": 220}', 1, 'per_unit', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'f6a2ccb9-56ae-4eb0-96f2-ef9b891a5f31', 'wall_double', 'Wall Bracket (Double)', '{"price": 388}', 2, 'per_unit', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'f6a2ccb9-56ae-4eb0-96f2-ef9b891a5f31', 'ceiling_clamp', 'Ceiling Clamp', '{"price": 40}', 3, 'per_unit', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'f6a2ccb9-56ae-4eb0-96f2-ef9b891a5f31', 'wall_extra_long', 'Wall Bracket (Extra Long)', '{"price": 350}', 4, 'per_unit', '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Add tieback type values
INSERT INTO option_values (id, option_id, code, label, extra_data, order_index, pricing_method, account_id) VALUES 
  (gen_random_uuid(), '32e5fdd3-c7fb-4214-974b-2db44bd1a980', 'none', 'None', '{"price": 0}', 0, 'fixed', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '32e5fdd3-c7fb-4214-974b-2db44bd1a980', 'standard_hook', 'Standard Hook', '{"price": 150}', 1, 'per_pair', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '32e5fdd3-c7fb-4214-974b-2db44bd1a980', 'decorative_hook', 'Decorative Hook', '{"price": 350}', 2, 'per_pair', '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), '32e5fdd3-c7fb-4214-974b-2db44bd1a980', 'holdback', 'Holdback', '{"price": 500}', 3, 'per_pair', '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Rename Rod Pocket2 to Rod Pocket
UPDATE enhanced_inventory_items 
SET name = 'Rod Pocket'
WHERE id = '78fe81dd-491a-400a-a5f2-a9bf1374f66e';
