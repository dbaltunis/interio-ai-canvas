-- Add option values for Roman Blinds treatment options
-- Based on CSV: Price grid list-roman blinds

-- Control System values
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('d3693062-40ed-4bf2-a949-4712890dbd98', 'white_ball_chain', 'White Ball Chain', '{"price": 0, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('d3693062-40ed-4bf2-a949-4712890dbd98', 'steel_ball_chain', 'Steel Ball Chain', '{"price": 0, "pricing_method": "fixed"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('d3693062-40ed-4bf2-a949-4712890dbd98', 'twin_system', 'Twin System', '{"price": 0, "pricing_method": "fixed"}', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('d3693062-40ed-4bf2-a949-4712890dbd98', 'motorised', 'Motorised', '{"price": 0, "pricing_method": "fixed"}', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Headrail values (price per running foot from CSV)
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('2c470879-e9ce-418d-b561-290abea53211', 'white_chain_headrail', 'White Chain Headrail', '{"price": 800, "pricing_method": "per_running_meter"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('2c470879-e9ce-418d-b561-290abea53211', 'steel_chain_headrail', 'Steel Chain Headrail', '{"price": 1160, "pricing_method": "per_running_meter"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('2c470879-e9ce-418d-b561-290abea53211', 'twin_headrail', 'Twin Headrail', '{"price": 8000, "pricing_method": "per_running_meter"}', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('2c470879-e9ce-418d-b561-290abea53211', 'motorised_headrail', 'Motorised Headrail', '{"price": 1400, "pricing_method": "per_running_meter"}', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Chain Length values (for white ball chain)
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'medium_4m', 'Medium 4m', '{"price": 296, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'long_6m', 'Long 6m', '{"price": 432, "pricing_method": "fixed"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('33e92f01-b75a-4e91-8a22-6df0b1518f4e', 'extra_long_8m', 'Extra Long 8m', '{"price": 608, "pricing_method": "fixed"}', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Steel Chain Length values
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('dc742779-f20c-4f9b-9af7-2d819c803da7', 'standard_2_4m', 'Standard 2.4m', '{"price": 500, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('dc742779-f20c-4f9b-9af7-2d819c803da7', 'medium_4m', 'Medium 4m', '{"price": 800, "pricing_method": "fixed"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('dc742779-f20c-4f9b-9af7-2d819c803da7', 'long_6m', 'Long 6m', '{"price": 1100, "pricing_method": "fixed"}', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('dc742779-f20c-4f9b-9af7-2d819c803da7', 'extra_long_8m', 'Extra Long 8m', '{"price": 1400, "pricing_method": "fixed"}', 3, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Motor Type values
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('bb37ae93-4fd5-4b78-b9a0-a6e5cc067c17', 'option_1', 'Motor Option 1', '{"price": 34000, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('bb37ae93-4fd5-4b78-b9a0-a6e5cc067c17', 'option_2', 'Motor Option 2', '{"price": 49000, "pricing_method": "fixed"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Remote Type values
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('1f2c97e0-0a9a-460d-b235-0b22d725e906', 'single_channel', 'Single Channel Remote', '{"price": 12000, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('1f2c97e0-0a9a-460d-b235-0b22d725e906', '15_channel', '15 Channel Remote', '{"price": 14000, "pricing_method": "fixed"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Installation values
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('48fa40c9-6287-47b2-a70c-75895e1aae8d', 'manual', 'Manual Installation', '{"price": 1000, "pricing_method": "per_window"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('48fa40c9-6287-47b2-a70c-75895e1aae8d', 'motorised', 'Motorised Installation', '{"price": 2500, "pricing_method": "per_window"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- Lining values (reuse standard concepts)
INSERT INTO option_values (option_id, code, label, extra_data, order_index, account_id) VALUES
('a3669486-2a7d-4453-93f3-e16987b5cda8', 'none', 'No Lining', '{"price": 0, "pricing_method": "fixed"}', 0, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('a3669486-2a7d-4453-93f3-e16987b5cda8', 'standard', 'Standard Lining', '{"price": 150, "pricing_method": "per_sqm"}', 1, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
('a3669486-2a7d-4453-93f3-e16987b5cda8', 'blackout', 'Blackout Lining', '{"price": 250, "pricing_method": "per_sqm"}', 2, '708d8e36-8fa3-4e07-b43b-c0a90941f991');