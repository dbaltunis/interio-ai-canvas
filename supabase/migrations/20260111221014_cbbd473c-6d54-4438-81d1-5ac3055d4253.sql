-- Insert Zebra Blind materials for Homekaara account
-- Using the user_id with most material items

INSERT INTO enhanced_inventory_items (
  name, sku, description, category, subcategory,
  selling_price, cost_price, unit, quantity, 
  active, tags, collection_name, pricing_method, user_id
) VALUES
  ('Zebra Vision White', 'ZEB-VIS-WHT', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 'material', 'zebra_fabric', 350, 180, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'light-filtering', 'white'], 'Zebra Vision Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Vision Cream', 'ZEB-VIS-CRM', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 'material', 'zebra_fabric', 350, 180, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'light-filtering', 'cream'], 'Zebra Vision Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Vision Grey', 'ZEB-VIS-GRY', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 'material', 'zebra_fabric', 350, 180, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'light-filtering', 'grey'], 'Zebra Vision Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Blockout White', 'ZEB-BLK-WHT', 'Day & Night blind fabric with opaque bands for complete privacy and light block', 'material', 'zebra_fabric', 450, 230, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'blockout', 'white'], 'Zebra Blockout Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Blockout Beige', 'ZEB-BLK-BEG', 'Day & Night blind fabric with opaque bands for complete privacy and light block', 'material', 'zebra_fabric', 450, 230, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'blockout', 'beige'], 'Zebra Blockout Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Metallic Silver', 'ZEB-MET-SLV', 'Premium metallic finish Day & Night blind fabric with subtle shimmer', 'material', 'zebra_fabric', 550, 280, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'metallic', 'silver', 'premium'], 'Zebra Premium Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Linen Natural', 'ZEB-LIN-NAT', 'Natural linen texture Day & Night blind fabric for organic aesthetic', 'material', 'zebra_fabric', 480, 245, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'linen', 'natural', 'textured'], 'Zebra Linen Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d'),
  ('Zebra Wood Walnut', 'ZEB-WOD-WAL', 'Wood-look Day & Night blind fabric with realistic grain pattern', 'material', 'zebra_fabric', 520, 265, 'sqm', 100, true, ARRAY['zebra', 'day-night', 'wood-look', 'walnut', 'premium'], 'Zebra Wood Collection', 'per_sqm', 'ec930f73-ef23-4430-921f-1b401859825d');