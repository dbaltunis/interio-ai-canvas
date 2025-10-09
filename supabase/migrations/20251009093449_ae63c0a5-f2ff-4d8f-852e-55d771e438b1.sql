-- Update all treatment options to include treatment_type in their description JSON

-- Venetian Blind options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"venetian_blind"'::jsonb
)::text
WHERE category = 'treatment_option'
AND (
  description::jsonb->>'option_type' IN ('slat_size', 'material', 'control_type', 'headrail_type', 'mount_type')
  AND (name ILIKE '%venetian%' OR name ILIKE '%slat%' OR name ILIKE '%aluminum%' OR name ILIKE '%wood%' OR name ILIKE '%faux%')
  AND description::jsonb->>'treatment_type' IS NULL
);

-- Roller Blind options  
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"roller_blind"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('tube_size', 'mount_type', 'fascia_type', 'bottom_rail_style', 'control_type', 'motor_type')
AND description::jsonb->>'treatment_type' IS NULL;

-- Roman Blind options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"roman_blind"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('headrail_type', 'fold_style', 'lining_type')
AND name ILIKE '%roman%'
AND description::jsonb->>'treatment_type' IS NULL;

-- Cellular/Honeycomb options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"cellular_blind"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('cell_size', 'cell_type')
AND description::jsonb->>'treatment_type' IS NULL;

-- Vertical Blind options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"vertical_blind"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('louvre_width', 'weight_style')
AND description::jsonb->>'treatment_type' IS NULL;

-- Panel Glide options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"panel_glide"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('track_type', 'panel_width')
AND description::jsonb->>'treatment_type' IS NULL;

-- Plantation Shutter options
UPDATE enhanced_inventory_items
SET description = jsonb_set(
  COALESCE(description::jsonb, '{}'::jsonb),
  '{treatment_type}',
  '"plantation_shutter"'::jsonb
)::text
WHERE category = 'treatment_option'
AND description::jsonb->>'option_type' IN ('louvre_size', 'frame_type', 'hinge_type', 'finish_type')
AND description::jsonb->>'treatment_type' IS NULL;