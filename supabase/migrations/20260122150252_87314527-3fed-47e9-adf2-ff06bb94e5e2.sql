-- Fix existing workshop_items by syncing correct values from windows_summary
-- This updates rail_width, drop, display_unit, and hems from the correct sources
-- Uses NULLIF to handle empty strings that can't be cast to numeric

UPDATE workshop_items wi
SET 
  measurements = jsonb_build_object(
    'rail_width', COALESCE(ws.rail_width, NULLIF(ws.measurements_details->>'rail_width', '')::numeric),
    'drop', COALESCE(ws.drop, NULLIF(ws.measurements_details->>'drop', '')::numeric),
    'display_unit', COALESCE(NULLIF(ws.measurements_details->>'unit', ''), 'cm'),
    'window_width', NULLIF(ws.measurements_details->>'window_width', '')::numeric,
    'window_height', NULLIF(ws.measurements_details->>'window_height', '')::numeric,
    'pooling', COALESCE(NULLIF(ws.measurements_details->>'pooling_amount', '')::numeric, NULLIF(ws.measurements_details->>'pooling', '')::numeric),
    'stackback_left', NULLIF(ws.measurements_details->>'stackback_left', '')::numeric,
    'stackback_right', NULLIF(ws.measurements_details->>'stackback_right', '')::numeric
  ),
  manufacturing_details = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(wi.manufacturing_details, '{}'),
        '{heading_type}',
        to_jsonb(COALESCE(NULLIF(ws.heading_details->>'heading_name', ''), 'Standard'))
      ),
      '{fullness_ratio}',
      to_jsonb(COALESCE(
        NULLIF(ws.measurements_details->>'fullness_ratio', '')::numeric,
        NULLIF(ws.heading_details->>'fullness_ratio', '')::numeric,
        NULLIF(ws.template_details->>'fullness_ratio', '')::numeric,
        1.0
      ))
    ),
    '{hems}',
    jsonb_build_object(
      'header', COALESCE(NULLIF(ws.measurements_details->>'header_hem', '')::numeric, NULLIF(ws.template_details->>'header_allowance', '')::numeric, 0),
      'bottom', COALESCE(NULLIF(ws.measurements_details->>'bottom_hem', '')::numeric, NULLIF(ws.template_details->>'bottom_hem', '')::numeric, 0),
      'side', COALESCE(NULLIF(ws.measurements_details->>'side_hems', '')::numeric, NULLIF(ws.template_details->>'side_hems', '')::numeric, 0),
      'seam', COALESCE(NULLIF(ws.measurements_details->>'seam_hems', '')::numeric, NULLIF(ws.template_details->>'seam_hems', '')::numeric, 0)
    )
  ),
  updated_at = now()
FROM windows_summary ws
WHERE wi.window_id = ws.window_id;