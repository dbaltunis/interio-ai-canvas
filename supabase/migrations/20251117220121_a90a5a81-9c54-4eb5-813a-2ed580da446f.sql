-- Populate pricing grids with actual pricing data

-- VENETIAN BLINDS - Standard Pricing (25mm Aluminum)
UPDATE pricing_grids
SET grid_data = '{
  "dropRanges": ["100", "150", "200", "250"],
  "widthRanges": ["50", "100", "150", "200", "250"],
  "prices": [
    [45, 55, 65, 75, 85],
    [50, 60, 70, 80, 90],
    [55, 65, 75, 85, 95],
    [60, 70, 80, 90, 100]
  ]
}'::jsonb
WHERE grid_code = 'VENETIAN_STD';

-- VERTICAL BLINDS - Standard Pricing (Fabric)
UPDATE pricing_grids
SET grid_data = '{
  "dropRanges": ["150", "200", "250"],
  "widthRanges": ["100", "150", "200", "250", "300"],
  "prices": [
    [55, 70, 85, 100, 115],
    [65, 80, 95, 110, 125],
    [75, 90, 105, 120, 135]
  ]
}'::jsonb
WHERE grid_code = 'VERTICAL_STD';

-- CELLULAR SHADES - Standard Pricing (Single Cell)
UPDATE pricing_grids
SET grid_data = '{
  "dropRanges": ["100", "150", "200", "250"],
  "widthRanges": ["50", "100", "150", "200"],
  "prices": [
    [60, 75, 90, 105],
    [70, 85, 100, 115],
    [80, 95, 110, 125],
    [90, 105, 120, 135]
  ]
}'::jsonb
WHERE grid_code = 'CELLULAR_STD';

-- SHUTTERS - Per Panel Pricing (Basswood)
UPDATE pricing_grids
SET grid_data = '{
  "dropRanges": ["150", "200", "250"],
  "widthRanges": ["40", "50", "60", "70"],
  "prices": [
    [180, 220, 260, 300],
    [220, 260, 300, 340],
    [260, 300, 340, 380]
  ]
}'::jsonb
WHERE grid_code = 'SHUTTERS_STD';

-- AWNINGS - Standard Pricing (Fixed Frame)
UPDATE pricing_grids
SET grid_data = '{
  "dropRanges": ["200", "250", "300"],
  "widthRanges": ["200", "250", "300", "350", "400"],
  "prices": [
    [180, 220, 260, 300, 340],
    [220, 260, 300, 340, 380],
    [260, 300, 340, 380, 420]
  ]
}'::jsonb
WHERE grid_code = 'AWNINGS_STD';