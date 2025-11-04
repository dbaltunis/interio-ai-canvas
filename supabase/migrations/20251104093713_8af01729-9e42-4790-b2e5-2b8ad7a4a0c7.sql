-- Deactivate existing system templates and insert new comprehensive templates
-- System templates use a specific system user_id

-- Step 1: Deactivate all existing specific system templates
UPDATE curtain_templates 
SET active = false 
WHERE is_system_default = true;

-- Step 2: Insert comprehensive base system templates
-- SOFT WINDOW TREATMENTS

INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, curtain_type, heading_name,
  fullness_ratio, fabric_width_type, fabric_direction, bottom_hem, side_hems, seam_hems,
  return_left, return_right, overlap, header_allowance, waste_percent, is_railroadable,
  lining_types, compatible_hardware, pricing_type, manufacturing_type,
  is_system_default, active
) VALUES
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Curtains', 'Traditional curtains with multiple heading options (eyelet, pencil pleat, pinch pleat, wave). Customize with lining, fullness, and hardware options.', 'curtains', 'curtain', 'Customizable', 2.0, 'wide', 'standard', 10, 5, 2, 5, 5, 10, 15, 10, false, '[{"type": "Unlined", "price_per_metre": 0, "labour_per_curtain": 0}]'::jsonb, ARRAY[]::text[], 'per_metre', 'machine', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Drapes', 'Heavy fabric drapes with formal pleat styles (double, triple, goblet). Options for interlining and weighted hems.', 'curtains', 'drape', 'Formal Pleat', 2.5, 'wide', 'standard', 12, 6, 2, 5, 5, 10, 15, 10, false, '[{"type": "Standard Lining", "price_per_metre": 15, "labour_per_curtain": 25}]'::jsonb, ARRAY[]::text[], 'per_metre', 'hand', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Sheers / Voiles', 'Lightweight translucent fabrics for privacy and light filtering. Options for single or double track systems.', 'curtains', 'sheer', 'Wave or Pencil', 2.0, 'wide', 'standard', 8, 4, 2, 0, 0, 0, 10, 5, false, '[{"type": "Unlined", "price_per_metre": 0, "labour_per_curtain": 0}]'::jsonb, ARRAY[]::text[], 'per_metre', 'machine', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Fabric Valances / Pelmets', 'Decorative top treatments. Soft valances or board-mounted pelmets. Shapes: straight, scalloped, or custom.', 'curtains', 'valance', 'Board Mounted', 1.5, 'wide', 'standard', 8, 4, 2, 5, 5, 0, 10, 10, false, '[{"type": "Interlining", "price_per_metre": 10, "labour_per_curtain": 30}]'::jsonb, ARRAY[]::text[], 'per_metre', 'hand', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Swags and Tails / Café', 'Traditional decorative treatments. Styles: swag and tails, lambrequins, or café curtains. Options for decorative trims and fringe.', 'curtains', 'swag', 'Decorative', 2.5, 'wide', 'standard', 10, 5, 2, 5, 5, 0, 15, 15, false, '[{"type": "Standard Lining", "price_per_metre": 12, "labour_per_curtain": 35}]'::jsonb, ARRAY[]::text[], 'per_metre', 'hand', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Valance / Pelmet / Cornice', 'Decorative top treatments. Options: timber board or soft fabric. Shapes: straight or custom. Can include LED lighting inside.', 'curtains', 'pelmet', 'Decorative', 1.2, 'wide', 'standard', 8, 4, 2, 0, 0, 0, 10, 10, false, '[]'::jsonb, ARRAY[]::text[], 'per_metre', 'hand', true, true);

-- HARD BLINDS
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, curtain_type, heading_name,
  fullness_ratio, fabric_width_type, fabric_direction, bottom_hem, side_hems, seam_hems,
  return_left, return_right, overlap, header_allowance, waste_percent, is_railroadable,
  lining_types, compatible_hardware, pricing_type, manufacturing_type,
  is_system_default, active
) VALUES
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Venetian Blinds', 'Horizontal slatted blinds. Materials: aluminium, wood, or faux wood. Slat sizes: 25mm, 35mm, 50mm. Control: cord and tilt wand or mono-control.', 'venetian_blinds', 'venetian', 'Standard', 1.0, 'narrow', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Mini Blinds', 'Narrow slat venetian blinds. Slat sizes: 16mm or 25mm. Ideal for compact windows. Options for perfect-fit frames.', 'venetian_blinds', 'mini_blind', 'Standard', 1.0, 'narrow', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Vertical Blinds', 'Vertical slatted blinds. Slat widths: 89mm or 127mm. Fabrics: dim-out, blackout, or PVC. Stack options: left, right, or split.', 'vertical_blinds', 'vertical', 'Standard', 1.0, 'narrow', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', true, true);

-- SHADES & SPECIALTY
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category, curtain_type, heading_name,
  fullness_ratio, fabric_width_type, fabric_direction, bottom_hem, side_hems, seam_hems,
  return_left, return_right, overlap, header_allowance, waste_percent, is_railroadable,
  lining_types, compatible_hardware, pricing_type, manufacturing_type,
  blind_header_hem_cm, blind_bottom_hem_cm, blind_side_hem_cm,
  is_system_default, active
) VALUES
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Roman Blinds', 'Fabric blinds with horizontal folds. Choose classic (with dowels), hobbled, or relaxed styles. Control options: chain, cord, or motorized.', 'roman_blinds', 'roman_blind', 'Standard', 1.0, 'wide', 'standard', 10, 4, 2, 0, 0, 0, 15, 10, false, '[{"type": "Dim-out", "price_per_metre": 12, "labour_per_curtain": 20}]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 8, 10, 4, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Roller Blinds', 'Simple roller mechanism with fabric options: screen (1%, 3%, 5% openness), dim-out, or blackout. Controls: chain, spring, or motorized.', 'roller_blinds', 'roller_blind', 'Standard', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 5, 5, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Double Roller / Zebra', 'Dual-layer roller with alternating transparent and opaque bands. Control light by aligning bands. Chain or motorized control.', 'roller_blinds', 'double_roller', 'Dual Layer', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 5, 5, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Pleated Blinds', 'Crisp pleated fabric in a compact system. Options: standard, blackout, or reflective backing. Operations: cord, tensioned, or top-down-bottom-up.', 'roller_blinds', 'pleated', 'Standard', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Cellular / Honeycomb Blinds', 'Energy-efficient honeycomb structure. Cell sizes: 25mm or 38mm. Single or double cell. Options: light filter, blackout, cordless, or top-down-bottom-up.', 'cellular_shades', 'cellular_shade', 'Standard', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Solar / Screen Shades', 'UV-blocking screen fabric. Openness factors: 1%, 3%, 5%, 10%. Reduces glare while maintaining view. Light or dark colours available.', 'roller_blinds', 'solar_shade', 'Standard', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Woven Wood / Bamboo Shades', 'Natural materials with woven texture. Weave types: open or tight. Optional linings: privacy or blackout. Styles: roman fold or waterfall.', 'roller_blinds', 'woven_wood', 'Natural', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 10, false, '[{"type": "Privacy Lining", "price_per_metre": 18, "labour_per_curtain": 25}]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Interior Shutters', 'Plantation shutters with adjustable louvres. Materials: MDF, timber, or PVC. Louvre sizes: 63mm, 76mm, 89mm. Panel styles: full height, café, or tier-on-tier.', 'shutters', 'shutter', 'Louvred', 1.0, 'narrow', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true),
('c9acec0b-88a1-4d97-93fd-172a513660bc', 'Panel Glide', 'Modern sliding panel track system. Ideal for large windows or room dividers. Multiple panel configurations available.', 'panel_glide', 'panel_glide', 'Standard', 1.0, 'wide', 'standard', 0, 0, 0, 0, 0, 0, 0, 5, false, '[]'::jsonb, ARRAY[]::text[], 'per_sqm', 'machine', 0, 0, 0, true, true);