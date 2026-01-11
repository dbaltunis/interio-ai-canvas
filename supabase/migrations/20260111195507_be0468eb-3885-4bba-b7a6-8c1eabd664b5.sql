-- Phase 2: Create Roman Blinds treatment options for Homekaara
-- Based on CSV: Price grid list-roman blinds

-- 1. Lining option (reuse from curtains concept)
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('lining', 'Lining', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', NULL, 1, false, true);

-- 2. Control System option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('control_system', 'Control System', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', NULL, 2, true, true);

-- 3. Headrail option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('headrail', 'Headrail', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_running_meter', 3, true, true);

-- 4. Chain Length option (for ball chain systems)
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('chain_length', 'Chain Length', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 4, false, true);

-- 5. Steel Chain Length option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('steel_chain_length', 'Steel Chain Length', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 5, false, true);

-- 6. Motor Type option (for motorised systems)
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('motor_type', 'Motor Type', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 6, false, true);

-- 7. Remote Type option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('remote_type', 'Remote Type', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'fixed', 7, false, true);

-- 8. Installation option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('installation', 'Installation', 'select', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_window', 8, false, true);

-- 9. Packaging option
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, order_index, required, visible) VALUES
('packaging', 'Packaging', 'boolean', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 9, false, true);

-- 10. Aluminium Pipe (auto-add based on width)
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, base_price, order_index, required, visible) VALUES
('aluminium_pipe', 'Aluminium Pipe', 'boolean', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_running_meter', 26.00, 10, false, true);

-- 11. Aluminium Flats
INSERT INTO treatment_options (key, label, input_type, treatment_category, account_id, pricing_method, base_price, order_index, required, visible) VALUES
('aluminium_flats', 'Aluminium Flats', 'boolean', 'roman_blinds', '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_running_meter', 200.00, 11, false, true);