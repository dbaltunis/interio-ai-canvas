-- Migration: Fix legacy pricing grids with missing product_type and price_group
-- Parses grid names to auto-assign product_type and price_group

-- Update grids where product_type is null based on name patterns
UPDATE pricing_grids SET product_type = 
  CASE 
    WHEN LOWER(name) ~ 'roller' THEN 'roller_blinds'
    WHEN LOWER(name) ~ 'roman' THEN 'roman_blinds'
    WHEN LOWER(name) ~ 'venetian' THEN 'venetian_blinds'
    WHEN LOWER(name) ~ 'vertical' THEN 'vertical_blinds'
    WHEN LOWER(name) ~ 'cellular|honeycomb' THEN 'cellular_blinds'
    WHEN LOWER(name) ~ 'panel' THEN 'panel_glide'
    WHEN LOWER(name) ~ 'shutter' THEN 'shutters'
    WHEN LOWER(name) ~ 'curtain' THEN 'curtains'
    WHEN LOWER(name) ~ 'awning' THEN 'awning'
    WHEN LOWER(name) ~ 'wallpaper' THEN 'wallpaper'
    ELSE product_type
  END
WHERE product_type IS NULL;

-- Update grids where price_group is null based on name patterns
-- Match patterns like "Group 1", "Group A", "- Budget", etc.
UPDATE pricing_grids SET price_group = 
  CASE
    -- Match "Group X" pattern
    WHEN name ~* 'group\s*[-_]?\s*(\d+)' THEN 
      UPPER(REGEXP_REPLACE(name, '.*group\s*[-_]?\s*(\w+).*', '\1', 'i'))
    WHEN name ~* 'group\s*[-_]?\s*([A-Za-z])' THEN 
      UPPER(REGEXP_REPLACE(name, '.*group\s*[-_]?\s*(\w+).*', '\1', 'i'))
    -- Match trailing " - X" pattern
    WHEN name ~ '\s+-\s+(\w+)$' THEN 
      UPPER(REGEXP_REPLACE(name, '.*\s+-\s+(\w+)$', '\1'))
    -- Match trailing number
    WHEN name ~ '\s+(\d+)$' THEN 
      REGEXP_REPLACE(name, '.*\s+(\d+)$', '\1')
    ELSE price_group
  END
WHERE price_group IS NULL;

-- For any remaining grids without product_type, set a default based on grid_code
UPDATE pricing_grids SET product_type = 
  CASE 
    WHEN LOWER(grid_code) ~ 'roller|rb' THEN 'roller_blinds'
    WHEN LOWER(grid_code) ~ 'roman|rom' THEN 'roman_blinds'
    WHEN LOWER(grid_code) ~ 'venetian|ven' THEN 'venetian_blinds'
    WHEN LOWER(grid_code) ~ 'vertical|vb' THEN 'vertical_blinds'
    WHEN LOWER(grid_code) ~ 'cell|honey' THEN 'cellular_blinds'
    WHEN LOWER(grid_code) ~ 'panel|pg' THEN 'panel_glide'
    WHEN LOWER(grid_code) ~ 'shut' THEN 'shutters'
    WHEN LOWER(grid_code) ~ 'curt' THEN 'curtains'
    ELSE product_type
  END
WHERE product_type IS NULL AND grid_code IS NOT NULL;

-- For grids still without price_group, try to extract from grid_code
UPDATE pricing_grids SET price_group = 
  CASE
    WHEN grid_code ~* '[-_](\d+)$' THEN 
      REGEXP_REPLACE(grid_code, '.*[-_](\d+)$', '\1')
    WHEN grid_code ~* '[-_]([A-Za-z])$' THEN 
      UPPER(REGEXP_REPLACE(grid_code, '.*[-_](\w)$', '\1'))
    ELSE price_group
  END
WHERE price_group IS NULL AND grid_code IS NOT NULL;