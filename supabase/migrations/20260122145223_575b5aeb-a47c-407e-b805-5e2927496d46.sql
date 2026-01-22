-- Fix existing workshop_items with correct data from windows_summary
-- This ensures shared work orders display the same data as in-app work orders

-- Update manufacturing_details with correct hems, fullness, and heading from windows_summary
UPDATE workshop_items wi
SET 
  manufacturing_details = jsonb_build_object(
    'type', COALESCE(wi.manufacturing_details->>'type', 'machine'),
    'cost', (wi.manufacturing_details->>'cost')::numeric,
    'fullness_ratio', COALESCE(
      (ws.measurements_details->>'fullness_ratio')::numeric,
      (ws.heading_details->>'fullness_ratio')::numeric,
      (wi.manufacturing_details->>'fullness_ratio')::numeric,
      1.0
    ),
    'heading_type', COALESCE(
      ws.heading_details->>'heading_name',
      'Standard'
    ),
    'lining_type', COALESCE(wi.manufacturing_details->>'lining_type', 'none'),
    'lining_name', wi.manufacturing_details->>'lining_name',
    'hems', jsonb_build_object(
      'header', COALESCE((ws.measurements_details->>'header_allowance_cm')::numeric, 0),
      'bottom', COALESCE((ws.measurements_details->>'bottom_hem_cm')::numeric, 0),
      'side', COALESCE((ws.measurements_details->>'side_hems_cm')::numeric, 0),
      'seam', COALESCE((ws.measurements_details->>'seam_hems_cm')::numeric, 0)
    ),
    'return_left', COALESCE((ws.measurements_details->>'return_left_cm')::numeric, 0),
    'return_right', COALESCE((ws.measurements_details->>'return_right_cm')::numeric, 0),
    'fabric_rotated', COALESCE((wi.manufacturing_details->>'fabric_rotated')::boolean, false),
    'hand_finished', COALESCE((wi.manufacturing_details->>'hand_finished')::boolean, false),
    'selected_options', COALESCE(wi.manufacturing_details->'selected_options', '[]'::jsonb),
    'hardware_details', wi.manufacturing_details->'hardware_details',
    'total_drop_cm', COALESCE((ws.measurements_details->>'total_drop_per_width_cm')::numeric, 0)
  ),
  measurements = jsonb_build_object(
    'rail_width', ws.rail_width,
    'drop', ws.drop,
    'window_width', ws.measurements_details->>'window_width',
    'window_height', ws.measurements_details->>'window_height',
    'pooling', COALESCE(ws.measurements_details->>'pooling_amount_cm', ws.measurements_details->>'pooling'),
    'stackback_left', ws.measurements_details->>'stackback_left',
    'stackback_right', ws.measurements_details->>'stackback_right',
    'display_unit', 'cm'
  ),
  fabric_details = CASE 
    WHEN ws.fabric_details IS NOT NULL THEN
      jsonb_set(
        COALESCE(ws.fabric_details, '{}'::jsonb),
        '{color}',
        COALESCE(
          ws.fabric_details->'color',
          to_jsonb(ws.measurements_details->>'selected_color'),
          '""'::jsonb
        )
      )
    ELSE wi.fabric_details
  END,
  linear_meters = COALESCE(ws.linear_meters, wi.linear_meters),
  widths_required = COALESCE(ws.widths_required, wi.widths_required),
  notes = COALESCE(
    ws.measurements_details->>'production_notes',
    ws.measurements_details->>'notes',
    CASE 
      WHEN wi.notes LIKE 'Auto-generated%' THEN NULL
      ELSE wi.notes
    END
  ),
  updated_at = now()
FROM windows_summary ws
WHERE wi.window_id = ws.window_id;