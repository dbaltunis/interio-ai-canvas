-- Fix workshop_items manufacturing_details with correct hem paths from measurements_details
UPDATE workshop_items wi
SET manufacturing_details = jsonb_build_object(
  'type', COALESCE(ws.manufacturing_type, 'machine'),
  'cost', ws.manufacturing_cost,
  'heading_type', ws.heading_details->>'heading_name',
  'fullness_ratio', (ws.heading_details->>'fullness_ratio')::numeric,
  'lining_type', ws.lining_type,
  'selected_options', ws.selected_options,
  'hems', jsonb_build_object(
    'header', (ws.measurements_details->>'header_hem')::numeric,
    'bottom', (ws.measurements_details->>'bottom_hem')::numeric,
    'side', (ws.measurements_details->>'side_hems')::numeric,
    'seam', (ws.measurements_details->>'seam_hems')::numeric
  )
),
linear_meters = ws.linear_meters,
widths_required = ws.widths_required
FROM windows_summary ws
WHERE wi.window_id = ws.window_id;

-- Also update the sync function to use correct paths
CREATE OR REPLACE FUNCTION sync_window_to_workshop(p_window_id uuid)
RETURNS void AS $$
DECLARE
  v_summary record;
BEGIN
  -- Get data from windows_summary view
  SELECT * INTO v_summary 
  FROM windows_summary 
  WHERE window_id = p_window_id;
  
  IF v_summary IS NULL THEN
    RETURN;
  END IF;
  
  -- Update workshop_items with current data
  UPDATE workshop_items wi
  SET 
    treatment_type = COALESCE(
      v_summary.treatment_type,
      v_summary.template_name,
      v_summary.template_details->>'treatment_category',
      wi.treatment_type
    ),
    manufacturing_details = jsonb_build_object(
      'type', COALESCE(v_summary.manufacturing_type, 'machine'),
      'cost', v_summary.manufacturing_cost,
      'heading_type', v_summary.heading_details->>'heading_name',
      'fullness_ratio', (v_summary.heading_details->>'fullness_ratio')::numeric,
      'lining_type', v_summary.lining_type,
      'selected_options', v_summary.selected_options,
      'hems', jsonb_build_object(
        'header', (v_summary.measurements_details->>'header_hem')::numeric,
        'bottom', (v_summary.measurements_details->>'bottom_hem')::numeric,
        'side', (v_summary.measurements_details->>'side_hems')::numeric,
        'seam', (v_summary.measurements_details->>'seam_hems')::numeric
      )
    ),
    fabric_details = v_summary.fabric_details,
    linear_meters = v_summary.linear_meters,
    widths_required = v_summary.widths_required,
    updated_at = now()
  WHERE wi.window_id = p_window_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;