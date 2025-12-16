-- Create Homekaara templates for Rachel's account
-- User ID: 708d8e36-8fa3-4e07-b43b-c0a90941f991

-- 1. Curtain Template
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, system_type,
  pricing_type, manufacturing_type, active,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
) VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Homekaara Curtains',
  'Standard curtain template with header options, linings, and tie-backs',
  'curtains',
  'curtain',
  'per_metre',
  'custom',
  true,
  2.5,
  'standard',
  'vertical',
  10,
  3,
  1.5
);

-- 2. Roman Blind Template
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, system_type,
  pricing_type, manufacturing_type, active, unit_price,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
) VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Homekaara Roman Blinds',
  'Roman blind template with per-sqft base pricing',
  'roman_blinds',
  'roman_blind',
  'per_sqm',
  'custom',
  true,
  360,
  1.0,
  'standard',
  'vertical',
  8,
  4,
  0
);

-- 3. Roller Blind Template
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, system_type,
  pricing_type, manufacturing_type, active,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
) VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Homekaara Roller Blinds',
  'Roller blind template with per-sqft pricing grids',
  'roller_blinds',
  'roller_blind',
  'pricing_grid',
  'ready_made',
  true,
  1.0,
  'standard',
  'horizontal',
  0,
  0,
  0
);

-- 4. Zebra/Dual Blind Template (using roller_blinds category)
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, system_type,
  pricing_type, manufacturing_type, active,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
) VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Homekaara Zebra/Dual Blinds',
  'Zebra/Dual blind template with per-sqft pricing grids',
  'roller_blinds',
  'roller_blind',
  'pricing_grid',
  'ready_made',
  true,
  1.0,
  'standard',
  'horizontal',
  0,
  0,
  0
);