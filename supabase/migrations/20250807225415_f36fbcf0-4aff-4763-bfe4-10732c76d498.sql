-- Clear existing data and add test data using surface IDs as window_id
DELETE FROM windows_summary;

-- Insert data using surface IDs as window_id (the actual approach)
INSERT INTO windows_summary (window_id, linear_meters, widths_required, price_per_meter, fabric_cost, lining_cost, manufacturing_cost, total_cost, pricing_type, waste_percent) VALUES 
-- Surface 1b39a2e2-af2b-4514-bda7-5e66b5aebe9b (Window 1 in Kitchen)
('1b39a2e2-af2b-4514-bda7-5e66b5aebe9b', 6.47, 4, 45.0, 291.06, 0, 50.0, 341.06, 'per_metre', 5),
-- Surface d891e09d-78f4-4a6b-bde6-a4db7ae89cc8 (Window 1 in Kitchen Copy)  
('d891e09d-78f4-4a6b-bde6-a4db7ae89cc8', 4.83, 3, 45.0, 217.35, 15.0, 60.0, 292.35, 'per_metre', 5);