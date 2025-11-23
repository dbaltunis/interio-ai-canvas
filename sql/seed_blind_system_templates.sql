-- System Templates for Grid-Based Blinds
-- Run this SQL in Supabase SQL Editor to add system templates for Cellular, Venetian, and Vertical blinds
-- These templates work with pricing grids and do NOT require fabric selection

-- ============================================
-- CELLULAR/HONEYCOMB SHADES
-- ============================================

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Cellular Shade - Single Cell',
  'Single cell honeycomb shade for energy efficiency and light control. Pricing based on width x drop grid.',
  'cellular_shades',
  'blind',
  0.00,
  'pricing_grid',
  'cellular',
  true,
  true,
  'cellular_single',
  '00000000-0000-0000-0000-000000000000',
  0, -- No hem allowances for blinds
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'cellular_single',
  active = true,
  is_system_default = true,
  updated_at = NOW();

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Cellular Shade - Double Cell',
  'Double cell honeycomb shade for maximum insulation and energy savings. Pricing based on width x drop grid.',
  'cellular_shades',
  'blind',
  0.00,
  'pricing_grid',
  'cellular',
  true,
  true,
  'cellular_double',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'cellular_double',
  active = true,
  is_system_default = true,
  updated_at = NOW();

-- ============================================
-- VENETIAN BLINDS
-- ============================================

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Venetian Blind - 25mm Slats',
  'Aluminum venetian blind with 25mm slats for precise light control. Pricing based on width x drop grid.',
  'venetian_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'venetian',
  true,
  true,
  'venetian_25mm',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'venetian_25mm',
  active = true,
  is_system_default = true,
  updated_at = NOW();

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Venetian Blind - 50mm Slats',
  'Aluminum venetian blind with 50mm slats for contemporary styling. Pricing based on width x drop grid.',
  'venetian_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'venetian',
  true,
  true,
  'venetian_50mm',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'venetian_50mm',
  active = true,
  is_system_default = true,
  updated_at = NOW();

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Venetian Blind - Wooden',
  'Premium wooden venetian blind for natural elegance. Pricing based on width x drop grid.',
  'venetian_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'venetian',
  true,
  true,
  'venetian_wood',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'venetian_wood',
  active = true,
  is_system_default = true,
  updated_at = NOW();

-- ============================================
-- VERTICAL BLINDS
-- ============================================

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Vertical Blind - 89mm Louvres',
  'Vertical blind with 89mm louvres for large windows and doors. Pricing based on width x drop grid.',
  'vertical_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'vertical',
  true,
  true,
  'vertical_89mm',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'vertical_89mm',
  active = true,
  is_system_default = true,
  updated_at = NOW();

INSERT INTO curtain_templates (
  name,
  description,
  treatment_category,
  curtain_type,
  unit_price,
  pricing_type,
  manufacturing_type,
  is_system_default,
  active,
  system_type,
  user_id,
  hem_allowance_header,
  hem_allowance_bottom,
  hem_allowance_side,
  created_at,
  updated_at
) VALUES (
  'Vertical Blind - 127mm Louvres',
  'Vertical blind with 127mm louvres for extra-large spaces. Pricing based on width x drop grid.',
  'vertical_blinds',
  'blind',
  0.00,
  'pricing_grid',
  'vertical',
  true,
  true,
  'vertical_127mm',
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (name, user_id) DO UPDATE SET
  pricing_type = 'pricing_grid',
  system_type = 'vertical_127mm',
  active = true,
  is_system_default = true,
  updated_at = NOW();

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify templates were created:
SELECT 
  name,
  treatment_category,
  system_type,
  pricing_type,
  is_system_default,
  active
FROM curtain_templates
WHERE is_system_default = true
  AND treatment_category IN ('cellular_shades', 'venetian_blinds', 'vertical_blinds')
ORDER BY treatment_category, name;
