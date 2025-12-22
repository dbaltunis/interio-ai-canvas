-- Migrate existing pricing grids to have proper unit field
-- Grids with max width >= 500 are in MM, otherwise CM

-- Set unit to 'mm' for grids where widths are large (curtain grids in MM)
UPDATE pricing_grids
SET grid_data = grid_data || '{"unit": "mm"}'::jsonb
WHERE active = true
AND grid_data->>'unit' IS NULL
AND (
  -- Check widthColumns array
  (grid_data->'widthColumns' IS NOT NULL 
   AND (grid_data->'widthColumns'->>0)::int >= 500)
  OR
  -- Check widthRanges array  
  (grid_data->'widthRanges' IS NOT NULL 
   AND (grid_data->'widthRanges'->>0)::int >= 500)
);

-- Set unit to 'cm' for grids where widths are smaller (blind grids in CM)
UPDATE pricing_grids
SET grid_data = grid_data || '{"unit": "cm"}'::jsonb
WHERE active = true
AND grid_data->>'unit' IS NULL;