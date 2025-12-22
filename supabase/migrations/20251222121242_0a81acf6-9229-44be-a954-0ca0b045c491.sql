-- Fix fullness_ratio values in windows_summary that were incorrectly saved as 2 or 2.5
-- This updates the measurements_details JSONB to use the actual heading's fullness_ratio

-- Step 1: Update windows where heading is stored but fullness doesn't match the heading
UPDATE windows_summary ws
SET measurements_details = jsonb_set(
  jsonb_set(
    COALESCE(measurements_details, '{}'::jsonb),
    '{fullness_ratio}',
    to_jsonb(COALESCE(eii.fullness_ratio, 1))
  ),
  '{heading_fullness}',
  to_jsonb(COALESCE(eii.fullness_ratio, 1))
)
FROM enhanced_inventory_items eii
WHERE 
  -- Match by selected_heading in measurements_details
  (ws.measurements_details->>'selected_heading')::text = eii.id::text
  AND eii.category = 'heading'
  AND eii.fullness_ratio IS NOT NULL
  -- Only update if fullness is different (or missing)
  AND (
    (ws.measurements_details->>'fullness_ratio')::numeric IS DISTINCT FROM eii.fullness_ratio
    OR (ws.measurements_details->>'heading_fullness')::numeric IS DISTINCT FROM eii.fullness_ratio
  );

-- Step 2: Also fix heading_details JSONB which stores the heading info
UPDATE windows_summary ws
SET heading_details = jsonb_set(
  COALESCE(heading_details, '{}'::jsonb),
  '{fullness_ratio}',
  to_jsonb(COALESCE(eii.fullness_ratio, 1))
)
FROM enhanced_inventory_items eii
WHERE 
  (ws.heading_details->>'id')::text = eii.id::text
  AND eii.category = 'heading'
  AND eii.fullness_ratio IS NOT NULL
  AND (ws.heading_details->>'fullness_ratio')::numeric IS DISTINCT FROM eii.fullness_ratio;