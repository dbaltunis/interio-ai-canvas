-- Insert seed data for measurement wizard

-- Insert test organization
INSERT INTO public.orgs (id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Demo Window Coverings Co.')
ON CONFLICT (id) DO NOTHING;

-- Insert measurement fields
INSERT INTO public.measurement_fields (id, org_id, key, label, unit) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'rail_width', 'Rail Width', 'mm'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'drop', 'Drop Length', 'mm'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'ceiling_to_floor', 'Ceiling to Floor', 'mm'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'wall_to_wall', 'Wall to Wall', 'mm'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'recess_depth', 'Recess Depth', 'mm')
ON CONFLICT (id) DO NOTHING;

-- Insert window types
INSERT INTO public.window_types (id, org_id, key, name, visual_key) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'standard', 'Standard Window', 'standard_window'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'bay3', 'Bay Window (3 panels)', 'bay_window_3'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'balcony_door', 'Balcony Door', 'balcony_door'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'terrace_doors', 'Terrace Doors', 'terrace_doors')
ON CONFLICT (id) DO NOTHING;

-- Insert product template
INSERT INTO public.product_templates (id, org_id, treatment_key, name, visual_key, default_mode) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'curtain', 'Curtain - Pinch Pleat Lined', 'curtain_pinch_pleat', 'quick')
ON CONFLICT (id) DO NOTHING;

-- Link measurements to template
INSERT INTO public.template_measurements (template_id, field_id, required) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', true),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', false),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', false)
ON CONFLICT (template_id, field_id) DO NOTHING;

-- Insert inventory items
INSERT INTO public.inventory_items (id, org_id, type, sku, name, attributes, uom, price, cost) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'fabric', 'FAB001', 'Cotton Damask - Ivory', '{"width_mm": 1400, "repeat_mm": 64, "colour": "ivory", "composition": "100% Cotton"}', 'metre', 45.00, 22.50),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'fabric', 'FAB002', 'Linen Blend - Natural', '{"width_mm": 1500, "repeat_mm": 0, "colour": "natural", "composition": "70% Linen 30% Cotton"}', 'metre', 38.00, 19.00),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'lining', 'LIN001', 'Standard Cotton Lining', '{"width_mm": 1400, "colour": "cream"}', 'metre', 12.00, 6.00),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'track', 'TRK001', 'Aluminium Curtain Track', '{"length_mm": 3000, "finish": "white"}', 'each', 85.00, 42.50),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', 'pole', 'POL001', 'Wooden Curtain Pole', '{"diameter_mm": 35, "finish": "oak", "length_mm": 2000}', 'each', 120.00, 60.00),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440000', 'hook', 'HOK001', 'Curtain Hooks', '{}', 'pack', 8.50, 4.25),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440000', 'tape', 'TAP001', 'Pinch Pleat Tape', '{"width_mm": 90}', 'metre', 3.50, 1.75),
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440000', 'service', 'LAB001', 'Making Labour', '{}', 'hour', 35.00, 35.00)
ON CONFLICT (id) DO NOTHING;