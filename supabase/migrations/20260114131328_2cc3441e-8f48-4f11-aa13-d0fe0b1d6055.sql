-- Create trigger function to keep workshop_items in sync with windows_summary
-- Note: windows_summary is a VIEW, so we create trigger on the underlying table 
-- that the view reads from. The view appears to expose data from surfaces or a backing table.
-- We'll create a function that can be called manually to sync instead

-- Create a function to sync a single window's data from windows_summary to workshop_items
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
      'selected_options', v_summary.template_details->'measurements_details'->'selected_options',
      'hems', jsonb_build_object(
        'header', v_summary.template_details->'measurements_details'->>'header_hem',
        'bottom', v_summary.template_details->'measurements_details'->>'bottom_hem',
        'side', v_summary.template_details->'measurements_details'->>'seam_hems'
      )
    ),
    fabric_details = v_summary.fabric_details,
    linear_meters = v_summary.linear_meters,
    widths_required = v_summary.widths_required,
    updated_at = now()
  WHERE wi.window_id = p_window_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to sync all windows for a project
CREATE OR REPLACE FUNCTION sync_project_to_workshop(p_project_id uuid)
RETURNS void AS $$
DECLARE
  v_window_id uuid;
BEGIN
  FOR v_window_id IN 
    SELECT window_id FROM workshop_items WHERE project_id = p_project_id
  LOOP
    PERFORM sync_window_to_workshop(v_window_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;