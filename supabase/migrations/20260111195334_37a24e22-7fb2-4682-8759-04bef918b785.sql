-- Phase 1.3: Create Rod Accessories treatment options for Homekaara
-- Based on CSV: Rings 6/ft, Finials 1 pair, End caps (sheer) 1 pair, Brackets 1/2.5ft

-- Create Rings option (auto-calculated: 6 per foot)
INSERT INTO treatment_options (
  key, label, input_type, treatment_category, account_id, 
  pricing_method, base_price, order_index, required, visible
) VALUES (
  'rings',
  'Curtain Rings',
  'number',
  'curtains',
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'per_unit',
  50.00,
  20,
  false,
  true
);

-- Create Finials option (1 pair per rod)
INSERT INTO treatment_options (
  key, label, input_type, treatment_category, account_id, 
  pricing_method, base_price, order_index, required, visible
) VALUES (
  'finials',
  'Finials',
  'number',
  'curtains',
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'per_pair',
  500.00,
  21,
  false,
  true
);

-- Create Rod End Caps option (for sheer rods)
INSERT INTO treatment_options (
  key, label, input_type, treatment_category, account_id, 
  pricing_method, base_price, order_index, required, visible
) VALUES (
  'rod_end_caps',
  'Rod End Caps',
  'number',
  'curtains',
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'per_pair',
  100.00,
  22,
  false,
  true
);

-- Create Rod Brackets option (1 per 2.5 feet)
INSERT INTO treatment_options (
  key, label, input_type, treatment_category, account_id, 
  pricing_method, base_price, order_index, required, visible
) VALUES (
  'rod_brackets',
  'Rod Brackets',
  'number',
  'curtains',
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'per_unit',
  150.00,
  23,
  false,
  true
);