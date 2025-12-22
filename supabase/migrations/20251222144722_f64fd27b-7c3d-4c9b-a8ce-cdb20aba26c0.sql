-- Import stitching/making charges from Excel data
-- Link each price to the appropriate headings

-- First, get the heading IDs for this user
-- Eyelet: 365210bd-8aae-4fc0-801f-0c02765c5e92
-- Pleated: eae74c2f-b2b6-4c2f-9846-b83b1801d2b1
-- Wave pleate: 293ff3e0-9e50-4867-9e9e-3182acfec238
-- Rod Pocket2: 78fe81dd-491a-400a-a5f2-a9bf1374f66e
-- European Pleat: cb41129a-f72a-4a80-b86c-10e7a2caaae7

-- Tailor Eyelet - ₹200/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Eyelet',
  'Standard tailor stitching rate for eyelet curtains',
  'service',
  'stitching',
  200,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["365210bd-8aae-4fc0-801f-0c02765c5e92"]}'::jsonb
);

-- Factory Eyelet - ₹225/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Eyelet',
  'Factory stitching rate for eyelet curtains',
  'service',
  'stitching',
  225,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["365210bd-8aae-4fc0-801f-0c02765c5e92"]}'::jsonb
);

-- Tailor Pleated - ₹150/m (applies to both Pleated and European Pleat)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Pleated',
  'Standard tailor stitching rate for pleated curtains',
  'service',
  'stitching',
  150,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["eae74c2f-b2b6-4c2f-9846-b83b1801d2b1", "cb41129a-f72a-4a80-b86c-10e7a2caaae7"]}'::jsonb
);

-- Factory Pleated - ₹250/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Pleated',
  'Factory stitching rate for pleated curtains',
  'service',
  'stitching',
  250,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["eae74c2f-b2b6-4c2f-9846-b83b1801d2b1", "cb41129a-f72a-4a80-b86c-10e7a2caaae7"]}'::jsonb
);

-- Tailor Wave - ₹180/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Wave',
  'Standard tailor stitching rate for wave curtains',
  'service',
  'stitching',
  180,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["293ff3e0-9e50-4867-9e9e-3182acfec238"]}'::jsonb
);

-- Factory Wave - ₹250/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Wave',
  'Factory stitching rate for wave curtains',
  'service',
  'stitching',
  250,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["293ff3e0-9e50-4867-9e9e-3182acfec238"]}'::jsonb
);

-- Tailor Rod Pocket - ₹150/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Rod Pocket',
  'Standard tailor stitching rate for rod pocket curtains',
  'service',
  'stitching',
  150,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["78fe81dd-491a-400a-a5f2-a9bf1374f66e"]}'::jsonb
);

-- Factory Rod Pocket - ₹200/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Rod Pocket',
  'Factory stitching rate for rod pocket curtains',
  'service',
  'stitching',
  200,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["78fe81dd-491a-400a-a5f2-a9bf1374f66e"]}'::jsonb
);

-- Tailor Tab Top - ₹200/m (no heading exists yet, empty array for now)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Tab Top',
  'Standard tailor stitching rate for tab top curtains',
  'service',
  'stitching',
  200,
  true,
  '{"pricing_method": "per_meter", "heading_ids": []}'::jsonb
);

-- Factory Tab Top - ₹250/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Tab Top',
  'Factory stitching rate for tab top curtains',
  'service',
  'stitching',
  250,
  true,
  '{"pricing_method": "per_meter", "heading_ids": []}'::jsonb
);

-- Tailor Flameaux - ₹200/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Flameaux',
  'Standard tailor stitching rate for flameaux curtains',
  'service',
  'stitching',
  200,
  true,
  '{"pricing_method": "per_meter", "heading_ids": []}'::jsonb
);

-- Factory Flameaux - ₹275/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Flameaux',
  'Factory stitching rate for flameaux curtains',
  'service',
  'stitching',
  275,
  true,
  '{"pricing_method": "per_meter", "heading_ids": []}'::jsonb
);

-- Tailor Eyelet With Lining - ₹230/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Tailor Eyelet With Lining',
  'Standard tailor stitching rate for eyelet curtains with lining',
  'service',
  'stitching',
  230,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["365210bd-8aae-4fc0-801f-0c02765c5e92"]}'::jsonb
);

-- Factory Eyelet With Lining - ₹250/m
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_per_meter, active, specifications)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Factory Eyelet With Lining',
  'Factory stitching rate for eyelet curtains with lining',
  'service',
  'stitching',
  250,
  true,
  '{"pricing_method": "per_meter", "heading_ids": ["365210bd-8aae-4fc0-801f-0c02765c5e92"]}'::jsonb
);