-- Add columns to windows_summary to store complete configuration state
ALTER TABLE windows_summary
ADD COLUMN IF NOT EXISTS window_type_id uuid,
ADD COLUMN IF NOT EXISTS window_type text,
ADD COLUMN IF NOT EXISTS window_type_key text,
ADD COLUMN IF NOT EXISTS treatment_type text,
ADD COLUMN IF NOT EXISTS treatment_category text,
ADD COLUMN IF NOT EXISTS selected_fabric_id uuid,
ADD COLUMN IF NOT EXISTS selected_hardware_id uuid,
ADD COLUMN IF NOT EXISTS selected_material_id uuid,
ADD COLUMN IF NOT EXISTS hardware_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS material_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS selected_heading_id text,
ADD COLUMN IF NOT EXISTS selected_lining_type text,
ADD COLUMN IF NOT EXISTS wallpaper_details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN windows_summary.window_type_id IS 'ID of the selected window type from treatment_options';
COMMENT ON COLUMN windows_summary.window_type IS 'Display name of the window type (e.g., Room Wall, Standard Window)';
COMMENT ON COLUMN windows_summary.window_type_key IS 'Key identifier for the window type';
COMMENT ON COLUMN windows_summary.treatment_type IS 'Type of treatment selected';
COMMENT ON COLUMN windows_summary.treatment_category IS 'Category of treatment (e.g., wallpaper, curtains, blinds)';
COMMENT ON COLUMN windows_summary.hardware_details IS 'Details of selected hardware items';
COMMENT ON COLUMN windows_summary.material_details IS 'Details of selected material/fabric items';
COMMENT ON COLUMN windows_summary.selected_heading_id IS 'ID of selected heading style';
COMMENT ON COLUMN windows_summary.selected_lining_type IS 'Type of lining selected';
COMMENT ON COLUMN windows_summary.wallpaper_details IS 'Complete wallpaper calculation details including meters, rolls, costs';