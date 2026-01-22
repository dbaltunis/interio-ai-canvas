-- Backfill fabric_rotated from windows_summary.measurements_details to workshop_items.manufacturing_details
-- This fixes existing records where fabric_rotated was incorrectly synced as false

UPDATE workshop_items wi
SET manufacturing_details = jsonb_set(
  COALESCE(wi.manufacturing_details, '{}'::jsonb),
  '{fabric_rotated}',
  COALESCE(
    (SELECT ws.measurements_details->'fabric_rotated' 
     FROM windows_summary ws 
     WHERE ws.window_id = wi.window_id),
    'false'::jsonb
  )
)
WHERE wi.window_id IS NOT NULL
  AND wi.manufacturing_details IS NOT NULL;