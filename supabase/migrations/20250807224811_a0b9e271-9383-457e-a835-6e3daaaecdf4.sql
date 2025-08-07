-- Clear existing test data
DELETE FROM windows_summary;

-- Insert data for actual measurement IDs 
-- These need to match the client_measurements IDs to show the correct data
INSERT INTO windows_summary (window_id, linear_meters, widths_required, price_per_meter, fabric_cost, lining_cost, manufacturing_cost, total_cost, pricing_type, waste_percent) VALUES 
-- This corresponds to the measurement cc38a0d1-d4cf-47a7-9af4-af0bb03ca539 (100" × 230")
('cc38a0d1-d4cf-47a7-9af4-af0bb03ca539', 4.83, 3, 45.0, 217.35, 15.0, 60.0, 292.35, 'per_metre', 5),
-- This corresponds to the measurement 93336fc2-59e6-4274-91eb-5eb887de73a7 (200" × 120")  
('93336fc2-59e6-4274-91eb-5eb887de73a7', 6.47, 4, 45.0, 291.06, 0, 50.0, 341.06, 'per_metre', 5);