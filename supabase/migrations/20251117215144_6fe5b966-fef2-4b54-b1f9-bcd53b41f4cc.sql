-- ===================================================================
-- Phase 1: Update System Templates to Use Pricing Grids
-- ===================================================================

-- Update Venetian Blinds templates to use pricing grids
UPDATE curtain_templates
SET pricing_type = 'pricing_grid',
    updated_at = now()
WHERE is_system_default = true
  AND treatment_category = 'venetian_blinds'
  AND pricing_type != 'pricing_grid';

-- Update Vertical Blinds templates to use pricing grids
UPDATE curtain_templates
SET pricing_type = 'pricing_grid',
    updated_at = now()
WHERE is_system_default = true
  AND treatment_category = 'vertical_blinds'
  AND pricing_type != 'pricing_grid';

-- Update Cellular Shades templates to use pricing grids
UPDATE curtain_templates
SET pricing_type = 'pricing_grid',
    updated_at = now()
WHERE is_system_default = true
  AND treatment_category = 'cellular_shades'
  AND pricing_type != 'pricing_grid';

-- Update Shutters templates to use pricing grids
UPDATE curtain_templates
SET pricing_type = 'pricing_grid',
    updated_at = now()
WHERE is_system_default = true
  AND treatment_category = 'shutters'
  AND pricing_type != 'pricing_grid';

-- Update Awnings templates to use pricing grids (stored as curtains category currently)
UPDATE curtain_templates
SET pricing_type = 'pricing_grid',
    updated_at = now()
WHERE is_system_default = true
  AND (heading_name LIKE '%Awning%' OR name LIKE '%Awning%')
  AND pricing_type != 'pricing_grid';

-- ===================================================================
-- Create Default Pricing Grids for Each Category
-- ===================================================================

DO $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Get a system user (first user in the system)
  SELECT id INTO system_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  -- If no users exist, skip grid creation
  IF system_user_id IS NULL THEN
    RAISE NOTICE 'No users found, skipping pricing grid creation';
    RETURN;
  END IF;

  -- ===================================================================
  -- 1. VENETIAN BLINDS Pricing Grid
  -- ===================================================================
  IF NOT EXISTS (SELECT 1 FROM pricing_grids WHERE user_id = system_user_id AND grid_code = 'VENETIAN_STD') THEN
    INSERT INTO pricing_grids (
      user_id,
      grid_code,
      name,
      description,
      grid_data,
      active
    ) VALUES (
      system_user_id,
      'VENETIAN_STD',
      'Venetian Blinds - Standard Pricing',
      'Default pricing grid for venetian blind systems based on width x drop',
      jsonb_build_object(
        'product_type', 'blind',
        'grid_type', 'width_height',
        'dimension_1_label', 'Width',
        'dimension_2_label', 'Drop',
        'dimension_1_unit', 'mm',
        'dimension_2_unit', 'mm',
        'rows', jsonb_build_array(
          jsonb_build_object('dimension1', 600, 'dimension2', 600, 'price', 85),
          jsonb_build_object('dimension1', 600, 'dimension2', 1200, 'price', 95),
          jsonb_build_object('dimension1', 600, 'dimension2', 1800, 'price', 105),
          jsonb_build_object('dimension1', 600, 'dimension2', 2400, 'price', 120),
          jsonb_build_object('dimension1', 600, 'dimension2', 3000, 'price', 135),
          jsonb_build_object('dimension1', 1200, 'dimension2', 600, 'price', 95),
          jsonb_build_object('dimension1', 1200, 'dimension2', 1200, 'price', 115),
          jsonb_build_object('dimension1', 1200, 'dimension2', 1800, 'price', 135),
          jsonb_build_object('dimension1', 1200, 'dimension2', 2400, 'price', 155),
          jsonb_build_object('dimension1', 1200, 'dimension2', 3000, 'price', 175),
          jsonb_build_object('dimension1', 1800, 'dimension2', 600, 'price', 115),
          jsonb_build_object('dimension1', 1800, 'dimension2', 1200, 'price', 145),
          jsonb_build_object('dimension1', 1800, 'dimension2', 1800, 'price', 175),
          jsonb_build_object('dimension1', 1800, 'dimension2', 2400, 'price', 205),
          jsonb_build_object('dimension1', 1800, 'dimension2', 3000, 'price', 235),
          jsonb_build_object('dimension1', 2400, 'dimension2', 600, 'price', 135),
          jsonb_build_object('dimension1', 2400, 'dimension2', 1200, 'price', 175),
          jsonb_build_object('dimension1', 2400, 'dimension2', 1800, 'price', 215),
          jsonb_build_object('dimension1', 2400, 'dimension2', 2400, 'price', 255),
          jsonb_build_object('dimension1', 2400, 'dimension2', 3000, 'price', 295),
          jsonb_build_object('dimension1', 3000, 'dimension2', 600, 'price', 155),
          jsonb_build_object('dimension1', 3000, 'dimension2', 1200, 'price', 205),
          jsonb_build_object('dimension1', 3000, 'dimension2', 1800, 'price', 255),
          jsonb_build_object('dimension1', 3000, 'dimension2', 2400, 'price', 305),
          jsonb_build_object('dimension1', 3000, 'dimension2', 3000, 'price', 355)
        )
      ),
      true
    );
    RAISE NOTICE 'Created Venetian Blinds pricing grid';
  END IF;

  -- ===================================================================
  -- 2. VERTICAL BLINDS Pricing Grid
  -- ===================================================================
  IF NOT EXISTS (SELECT 1 FROM pricing_grids WHERE user_id = system_user_id AND grid_code = 'VERTICAL_STD') THEN
    INSERT INTO pricing_grids (
      user_id,
      grid_code,
      name,
      description,
      grid_data,
      active
    ) VALUES (
      system_user_id,
      'VERTICAL_STD',
      'Vertical Blinds - Standard Pricing',
      'Default pricing grid for vertical blind systems based on track width x drop',
      jsonb_build_object(
        'product_type', 'blind',
        'grid_type', 'width_height',
        'dimension_1_label', 'Track Width',
        'dimension_2_label', 'Drop',
        'dimension_1_unit', 'mm',
        'dimension_2_unit', 'mm',
        'rows', jsonb_build_array(
          jsonb_build_object('dimension1', 800, 'dimension2', 1000, 'price', 95),
          jsonb_build_object('dimension1', 800, 'dimension2', 1500, 'price', 110),
          jsonb_build_object('dimension1', 800, 'dimension2', 2000, 'price', 125),
          jsonb_build_object('dimension1', 800, 'dimension2', 2500, 'price', 145),
          jsonb_build_object('dimension1', 800, 'dimension2', 3000, 'price', 165),
          jsonb_build_object('dimension1', 1500, 'dimension2', 1000, 'price', 125),
          jsonb_build_object('dimension1', 1500, 'dimension2', 1500, 'price', 155),
          jsonb_build_object('dimension1', 1500, 'dimension2', 2000, 'price', 185),
          jsonb_build_object('dimension1', 1500, 'dimension2', 2500, 'price', 215),
          jsonb_build_object('dimension1', 1500, 'dimension2', 3000, 'price', 245),
          jsonb_build_object('dimension1', 3000, 'dimension2', 1000, 'price', 185),
          jsonb_build_object('dimension1', 3000, 'dimension2', 1500, 'price', 235),
          jsonb_build_object('dimension1', 3000, 'dimension2', 2000, 'price', 285),
          jsonb_build_object('dimension1', 3000, 'dimension2', 2500, 'price', 335),
          jsonb_build_object('dimension1', 3000, 'dimension2', 3000, 'price', 385),
          jsonb_build_object('dimension1', 4500, 'dimension2', 1000, 'price', 245),
          jsonb_build_object('dimension1', 4500, 'dimension2', 1500, 'price', 315),
          jsonb_build_object('dimension1', 4500, 'dimension2', 2000, 'price', 385),
          jsonb_build_object('dimension1', 4500, 'dimension2', 2500, 'price', 455),
          jsonb_build_object('dimension1', 4500, 'dimension2', 3000, 'price', 525),
          jsonb_build_object('dimension1', 6000, 'dimension2', 1000, 'price', 305),
          jsonb_build_object('dimension1', 6000, 'dimension2', 1500, 'price', 395),
          jsonb_build_object('dimension1', 6000, 'dimension2', 2000, 'price', 485),
          jsonb_build_object('dimension1', 6000, 'dimension2', 2500, 'price', 575),
          jsonb_build_object('dimension1', 6000, 'dimension2', 3000, 'price', 665)
        )
      ),
      true
    );
    RAISE NOTICE 'Created Vertical Blinds pricing grid';
  END IF;

  -- ===================================================================
  -- 3. CELLULAR SHADES Pricing Grid
  -- ===================================================================
  IF NOT EXISTS (SELECT 1 FROM pricing_grids WHERE user_id = system_user_id AND grid_code = 'CELLULAR_STD') THEN
    INSERT INTO pricing_grids (
      user_id,
      grid_code,
      name,
      description,
      grid_data,
      active
    ) VALUES (
      system_user_id,
      'CELLULAR_STD',
      'Cellular Shades - Standard Pricing',
      'Default pricing grid for cellular/honeycomb shade systems based on width x drop',
      jsonb_build_object(
        'product_type', 'blind',
        'grid_type', 'width_height',
        'dimension_1_label', 'Width',
        'dimension_2_label', 'Drop',
        'dimension_1_unit', 'mm',
        'dimension_2_unit', 'mm',
        'rows', jsonb_build_array(
          jsonb_build_object('dimension1', 400, 'dimension2', 600, 'price', 75),
          jsonb_build_object('dimension1', 400, 'dimension2', 1200, 'price', 85),
          jsonb_build_object('dimension1', 400, 'dimension2', 1800, 'price', 95),
          jsonb_build_object('dimension1', 400, 'dimension2', 2400, 'price', 110),
          jsonb_build_object('dimension1', 800, 'dimension2', 600, 'price', 95),
          jsonb_build_object('dimension1', 800, 'dimension2', 1200, 'price', 115),
          jsonb_build_object('dimension1', 800, 'dimension2', 1800, 'price', 135),
          jsonb_build_object('dimension1', 800, 'dimension2', 2400, 'price', 155),
          jsonb_build_object('dimension1', 1200, 'dimension2', 600, 'price', 115),
          jsonb_build_object('dimension1', 1200, 'dimension2', 1200, 'price', 145),
          jsonb_build_object('dimension1', 1200, 'dimension2', 1800, 'price', 175),
          jsonb_build_object('dimension1', 1200, 'dimension2', 2400, 'price', 205),
          jsonb_build_object('dimension1', 1600, 'dimension2', 600, 'price', 135),
          jsonb_build_object('dimension1', 1600, 'dimension2', 1200, 'price', 175),
          jsonb_build_object('dimension1', 1600, 'dimension2', 1800, 'price', 215),
          jsonb_build_object('dimension1', 1600, 'dimension2', 2400, 'price', 255),
          jsonb_build_object('dimension1', 2000, 'dimension2', 600, 'price', 155),
          jsonb_build_object('dimension1', 2000, 'dimension2', 1200, 'price', 205),
          jsonb_build_object('dimension1', 2000, 'dimension2', 1800, 'price', 255),
          jsonb_build_object('dimension1', 2000, 'dimension2', 2400, 'price', 305)
        )
      ),
      true
    );
    RAISE NOTICE 'Created Cellular Shades pricing grid';
  END IF;

  -- ===================================================================
  -- 4. SHUTTERS Pricing Grid
  -- ===================================================================
  IF NOT EXISTS (SELECT 1 FROM pricing_grids WHERE user_id = system_user_id AND grid_code = 'SHUTTERS_STD') THEN
    INSERT INTO pricing_grids (
      user_id,
      grid_code,
      name,
      description,
      grid_data,
      active
    ) VALUES (
      system_user_id,
      'SHUTTERS_STD',
      'Shutters - Per Panel Pricing',
      'Default pricing grid for shutter systems based on panel width x height',
      jsonb_build_object(
        'product_type', 'shutter',
        'grid_type', 'width_height',
        'dimension_1_label', 'Panel Width',
        'dimension_2_label', 'Height',
        'dimension_1_unit', 'mm',
        'dimension_2_unit', 'mm',
        'rows', jsonb_build_array(
          jsonb_build_object('dimension1', 300, 'dimension2', 800, 'price', 280),
          jsonb_build_object('dimension1', 300, 'dimension2', 1200, 'price', 320),
          jsonb_build_object('dimension1', 300, 'dimension2', 1600, 'price', 360),
          jsonb_build_object('dimension1', 300, 'dimension2', 2000, 'price', 400),
          jsonb_build_object('dimension1', 300, 'dimension2', 2400, 'price', 450),
          jsonb_build_object('dimension1', 450, 'dimension2', 800, 'price', 350),
          jsonb_build_object('dimension1', 450, 'dimension2', 1200, 'price', 410),
          jsonb_build_object('dimension1', 450, 'dimension2', 1600, 'price', 470),
          jsonb_build_object('dimension1', 450, 'dimension2', 2000, 'price', 530),
          jsonb_build_object('dimension1', 450, 'dimension2', 2400, 'price', 600),
          jsonb_build_object('dimension1', 600, 'dimension2', 800, 'price', 420),
          jsonb_build_object('dimension1', 600, 'dimension2', 1200, 'price', 500),
          jsonb_build_object('dimension1', 600, 'dimension2', 1600, 'price', 580),
          jsonb_build_object('dimension1', 600, 'dimension2', 2000, 'price', 660),
          jsonb_build_object('dimension1', 600, 'dimension2', 2400, 'price', 750),
          jsonb_build_object('dimension1', 800, 'dimension2', 800, 'price', 490),
          jsonb_build_object('dimension1', 800, 'dimension2', 1200, 'price', 590),
          jsonb_build_object('dimension1', 800, 'dimension2', 1600, 'price', 690),
          jsonb_build_object('dimension1', 800, 'dimension2', 2000, 'price', 790),
          jsonb_build_object('dimension1', 800, 'dimension2', 2400, 'price', 900)
        )
      ),
      true
    );
    RAISE NOTICE 'Created Shutters pricing grid';
  END IF;

  -- ===================================================================
  -- 5. AWNINGS Pricing Grid
  -- ===================================================================
  IF NOT EXISTS (SELECT 1 FROM pricing_grids WHERE user_id = system_user_id AND grid_code = 'AWNINGS_STD') THEN
    INSERT INTO pricing_grids (
      user_id,
      grid_code,
      name,
      description,
      grid_data,
      active
    ) VALUES (
      system_user_id,
      'AWNINGS_STD',
      'Awnings - Standard Pricing',
      'Default pricing grid for awning systems based on projection x width',
      jsonb_build_object(
        'product_type', 'awning',
        'grid_type', 'projection_width',
        'dimension_1_label', 'Projection',
        'dimension_2_label', 'Width',
        'dimension_1_unit', 'mm',
        'dimension_2_unit', 'mm',
        'rows', jsonb_build_array(
          jsonb_build_object('dimension1', 1500, 'dimension2', 2000, 'price', 450),
          jsonb_build_object('dimension1', 1500, 'dimension2', 2500, 'price', 525),
          jsonb_build_object('dimension1', 1500, 'dimension2', 3000, 'price', 600),
          jsonb_build_object('dimension1', 1500, 'dimension2', 3500, 'price', 675),
          jsonb_build_object('dimension1', 1500, 'dimension2', 4000, 'price', 750),
          jsonb_build_object('dimension1', 2000, 'dimension2', 2000, 'price', 550),
          jsonb_build_object('dimension1', 2000, 'dimension2', 2500, 'price', 650),
          jsonb_build_object('dimension1', 2000, 'dimension2', 3000, 'price', 750),
          jsonb_build_object('dimension1', 2000, 'dimension2', 3500, 'price', 850),
          jsonb_build_object('dimension1', 2000, 'dimension2', 4000, 'price', 950),
          jsonb_build_object('dimension1', 2500, 'dimension2', 2000, 'price', 650),
          jsonb_build_object('dimension1', 2500, 'dimension2', 2500, 'price', 775),
          jsonb_build_object('dimension1', 2500, 'dimension2', 3000, 'price', 900),
          jsonb_build_object('dimension1', 2500, 'dimension2', 3500, 'price', 1025),
          jsonb_build_object('dimension1', 2500, 'dimension2', 4000, 'price', 1150),
          jsonb_build_object('dimension1', 3000, 'dimension2', 2000, 'price', 750),
          jsonb_build_object('dimension1', 3000, 'dimension2', 2500, 'price', 900),
          jsonb_build_object('dimension1', 3000, 'dimension2', 3000, 'price', 1050),
          jsonb_build_object('dimension1', 3000, 'dimension2', 3500, 'price', 1200),
          jsonb_build_object('dimension1', 3000, 'dimension2', 4000, 'price', 1350),
          jsonb_build_object('dimension1', 3500, 'dimension2', 2000, 'price', 850),
          jsonb_build_object('dimension1', 3500, 'dimension2', 2500, 'price', 1025),
          jsonb_build_object('dimension1', 3500, 'dimension2', 3000, 'price', 1200),
          jsonb_build_object('dimension1', 3500, 'dimension2', 3500, 'price', 1375),
          jsonb_build_object('dimension1', 3500, 'dimension2', 4000, 'price', 1550),
          jsonb_build_object('dimension1', 4000, 'dimension2', 2000, 'price', 950),
          jsonb_build_object('dimension1', 4000, 'dimension2', 2500, 'price', 1150),
          jsonb_build_object('dimension1', 4000, 'dimension2', 3000, 'price', 1350),
          jsonb_build_object('dimension1', 4000, 'dimension2', 3500, 'price', 1550),
          jsonb_build_object('dimension1', 4000, 'dimension2', 4000, 'price', 1750)
        )
      ),
      true
    );
    RAISE NOTICE 'Created Awnings pricing grid';
  END IF;

  RAISE NOTICE 'Phase 1 Complete: All system templates updated and pricing grids created';
    
END $$;