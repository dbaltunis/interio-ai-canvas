-- Insert Zebra Blind materials into enhanced_inventory_items
-- These will appear under Materials → Zebra Fabrics

INSERT INTO enhanced_inventory_items (
  name, sku, description, category, subcategory,
  selling_price, cost_price, unit, quantity, 
  active, tags, collection_name, pricing_method, user_id
)
SELECT 
  v.name, v.sku, v.description, 'material', 'zebra_fabric',
  v.selling_price, v.cost_price, 'sqm', 100,
  true, v.tags, v.collection_name, 'per_sqm', auth.uid()
FROM (VALUES
  ('Zebra Vision White', 'ZEB-VIS-WHT', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 350, 180, ARRAY['zebra', 'day-night', 'light-filtering', 'white'], 'Zebra Vision Collection'),
  ('Zebra Vision Cream', 'ZEB-VIS-CRM', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 350, 180, ARRAY['zebra', 'day-night', 'light-filtering', 'cream'], 'Zebra Vision Collection'),
  ('Zebra Vision Grey', 'ZEB-VIS-GRY', 'Day & Night blind fabric with alternating sheer and opaque bands - light filtering', 350, 180, ARRAY['zebra', 'day-night', 'light-filtering', 'grey'], 'Zebra Vision Collection'),
  ('Zebra Blockout White', 'ZEB-BLK-WHT', 'Day & Night blind fabric with opaque bands for complete privacy and light block', 450, 230, ARRAY['zebra', 'day-night', 'blockout', 'white'], 'Zebra Blockout Collection'),
  ('Zebra Blockout Beige', 'ZEB-BLK-BEG', 'Day & Night blind fabric with opaque bands for complete privacy and light block', 450, 230, ARRAY['zebra', 'day-night', 'blockout', 'beige'], 'Zebra Blockout Collection'),
  ('Zebra Metallic Silver', 'ZEB-MET-SLV', 'Premium metallic finish Day & Night blind fabric with subtle shimmer', 550, 280, ARRAY['zebra', 'day-night', 'metallic', 'silver', 'premium'], 'Zebra Premium Collection'),
  ('Zebra Linen Natural', 'ZEB-LIN-NAT', 'Natural linen texture Day & Night blind fabric for organic aesthetic', 480, 245, ARRAY['zebra', 'day-night', 'linen', 'natural', 'textured'], 'Zebra Linen Collection'),
  ('Zebra Wood Walnut', 'ZEB-WOD-WAL', 'Wood-look Day & Night blind fabric with realistic grain pattern', 520, 265, ARRAY['zebra', 'day-night', 'wood-look', 'walnut', 'premium'], 'Zebra Wood Collection')
) AS v(name, sku, description, selling_price, cost_price, tags, collection_name)
WHERE auth.uid() IS NOT NULL;