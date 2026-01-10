-- Phase 1: Update Homekaara's existing hardware items with accessory prices, mount types, and brand info
-- This updates the 21 tracks and 3 rods from the CSV data

-- Update Modique Curtain Track - Ivory
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'Ivory',
    'price_per_foot', 118.67,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%Ivory%' OR metadata->>'color' = 'Ivory');

-- Update Modique Curtain Track - White
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'White',
    'price_per_foot', 118.67,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%White%' OR metadata->>'color' = 'White');

-- Update Modique Curtain Track - Silver
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'Silver',
    'price_per_foot', 130.00,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%Silver%' OR metadata->>'color' = 'Silver');

-- Update Modique Curtain Track - Black
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'Black',
    'price_per_foot', 130.00,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%Black%' OR metadata->>'color' = 'Black');

-- Update Modique Curtain Track - Champagne
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'Champagne',
    'price_per_foot', 130.00,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%Champagne%' OR metadata->>'color' = 'Champagne');

-- Update Modique Curtain Track - Matt Gold
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'ceiling,wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'color', 'Matt Gold',
    'price_per_foot', 130.00,
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 10,
      'end_cap', 32,
      'ceiling_bracket', 40,
      'wall_single_bracket', 220,
      'wall_double_bracket', 388,
      'jointer', 260,
      'overlap', 520,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Modique Curtain Track%'
  AND (name ILIKE '%Matt Gold%' OR name ILIKE '%Gold%' OR metadata->>'color' = 'Matt Gold');

-- Update all Wave/Ripplefold tracks with WALL ONLY mounting
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'HOMEKAARA',
    'headings_compatible', ARRAY['ripplefold', 'wave'],
    'accessory_prices', jsonb_build_object(
      'runner', 20,
      'end_cap', 140,
      'wall_single_bracket', 520,
      'wall_double_bracket', 780,
      'jointer', 520,
      'overlap', 1560,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND (name ILIKE '%Wave%' OR name ILIKE '%Ripplefold%')
  AND subcategory = 'track';

-- Update Kings Brand Tracks (Wall Only, Premium Pricing)
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = 'wall',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', 'Kings',
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', jsonb_build_object(
      'runner', 15,
      'end_cap', 100,
      'wall_single_bracket', 400,
      'wall_double_bracket', 600,
      'jointer', 400,
      'overlap', 800,
      'magnet', 220,
      'wand', 2080
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND name ILIKE '%Kings%'
  AND subcategory = 'track';

-- Update all remaining tracks without specific brand to HOMEKAARA default
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = COALESCE(hardware_mounting_type, 'ceiling,wall'),
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', COALESCE(metadata->>'brand', 'HOMEKAARA'),
    'headings_compatible', ARRAY['pleated', 'ripplefold'],
    'accessory_prices', COALESCE(
      metadata->'accessory_prices',
      jsonb_build_object(
        'runner', 10,
        'end_cap', 32,
        'ceiling_bracket', 40,
        'wall_single_bracket', 220,
        'wall_double_bracket', 388,
        'jointer', 260,
        'overlap', 520,
        'magnet', 220,
        'wand', 2080
      )
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND subcategory = 'track'
  AND category = 'hardware'
  AND metadata->'accessory_prices' IS NULL;

-- Update all rods with default accessory prices
UPDATE public.enhanced_inventory_items
SET 
  hardware_mounting_type = COALESCE(hardware_mounting_type, 'wall'),
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'brand', COALESCE(metadata->>'brand', 'HOMEKAARA'),
    'headings_compatible', ARRAY['eyelet', 'rod_pocket', 'pleated_ring'],
    'accessory_prices', COALESCE(
      metadata->'accessory_prices',
      jsonb_build_object(
        'ring', 25,
        'finial', 350,
        'wall_bracket', 280,
        'support_bracket', 180,
        'jointer', 200
      )
    )
  )
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND subcategory = 'rod'
  AND category = 'hardware'
  AND metadata->'accessory_prices' IS NULL;