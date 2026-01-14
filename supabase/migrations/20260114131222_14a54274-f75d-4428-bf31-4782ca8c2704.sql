-- 1. Sync all surface notes to workshop_items (one-time fix)
UPDATE workshop_items wi
SET notes = s.notes
FROM surfaces s
WHERE wi.window_id = s.id
  AND s.notes IS NOT NULL
  AND s.notes != ''
  AND (wi.notes IS NULL OR wi.notes LIKE 'Auto-generated%' OR wi.notes = '');

-- 2. Sync treatment_type from windows_summary (it's a VIEW with direct columns)
UPDATE workshop_items wi
SET treatment_type = COALESCE(
  ws.treatment_type,
  ws.template_name,
  ws.template_details->>'treatment_category',
  'curtains'
)
FROM windows_summary ws
WHERE wi.window_id = ws.window_id
  AND ws.treatment_type IS NOT NULL;

-- 3. Sync manufacturing_details with options from windows_summary (direct columns)
UPDATE workshop_items wi
SET manufacturing_details = jsonb_build_object(
  'type', COALESCE(ws.manufacturing_type, 'machine'),
  'cost', ws.manufacturing_cost,
  'heading_type', ws.heading_details->>'heading_name',
  'fullness_ratio', (ws.heading_details->>'fullness_ratio')::numeric,
  'lining_type', ws.lining_type,
  'selected_options', ws.template_details->'measurements_details'->'selected_options',
  'hems', jsonb_build_object(
    'header', ws.template_details->'measurements_details'->>'header_hem',
    'bottom', ws.template_details->'measurements_details'->>'bottom_hem',
    'side', ws.template_details->'measurements_details'->>'seam_hems'
  )
),
linear_meters = ws.linear_meters,
widths_required = ws.widths_required
FROM windows_summary ws
WHERE wi.window_id = ws.window_id;