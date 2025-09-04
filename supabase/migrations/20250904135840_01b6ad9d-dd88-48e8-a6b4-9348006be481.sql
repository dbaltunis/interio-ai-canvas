-- Add missing columns to window_types table for Phase 1
ALTER TABLE public.window_types 
ADD COLUMN IF NOT EXISTS configurations JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS measurement_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Insert default window types if table is empty
INSERT INTO public.window_types (org_id, key, name, visual_key, description, configurations, measurement_fields, sort_order)
VALUES 
  ((SELECT user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1), 'standard', 'Standard Window', 'standard', 'Regular rectangular window with standard measurements', '{"default_hardware": "rod", "common_treatments": ["curtains", "blinds"]}', '[{"name": "width", "label": "Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}]', 1),
  ((SELECT user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1), 'bay', 'Bay Window', 'bay', 'Three-panel bay window requiring special measurements', '{"default_hardware": "track", "common_treatments": ["curtains"], "panels": 3}', '[{"name": "center_width", "label": "Center Width", "type": "number", "required": true}, {"name": "side_width", "label": "Side Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}, {"name": "angle", "label": "Bay Angle", "type": "number", "default": 45}]', 2),
  ((SELECT user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1), 'french_doors', 'French Doors', 'french_doors', 'Double French doors with glass panels', '{"default_hardware": "rod", "common_treatments": ["curtains"], "panels": 2}', '[{"name": "door_width", "label": "Door Width", "type": "number", "required": true}, {"name": "door_height", "label": "Door Height", "type": "number", "required": true}, {"name": "gap_width", "label": "Gap Between Doors", "type": "number", "default": 2}]', 3),
  ((SELECT user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1), 'sliding_doors', 'Sliding Doors', 'sliding_doors', 'Large sliding patio doors', '{"default_hardware": "track", "common_treatments": ["vertical_blinds", "curtains"]}', '[{"name": "total_width", "label": "Total Width", "type": "number", "required": true}, {"name": "door_height", "label": "Door Height", "type": "number", "required": true}, {"name": "overlap", "label": "Panel Overlap", "type": "number", "default": 10}]', 4),
  ((SELECT user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1), 'large_window', 'Large Window', 'large_window', 'Extra large window requiring multiple panels', '{"default_hardware": "track", "common_treatments": ["curtains", "blinds"]}', '[{"name": "total_width", "label": "Total Width", "type": "number", "required": true}, {"name": "total_height", "label": "Total Height", "type": "number", "required": true}, {"name": "mullion_count", "label": "Number of Mullions", "type": "number", "default": 2}]', 5)
ON CONFLICT (key, org_id) DO NOTHING;

-- Add RLS policies for window_types
ALTER TABLE public.window_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view org window types" ON public.window_types;
DROP POLICY IF EXISTS "Users can manage org window types" ON public.window_types;

-- Users can view window types from their organization
CREATE POLICY "Users can view org window types" ON public.window_types
  FOR SELECT USING (org_id = (SELECT get_account_owner(auth.uid())));

-- Users can manage window types in their organization  
CREATE POLICY "Users can manage org window types" ON public.window_types
  FOR ALL USING (org_id = (SELECT get_account_owner(auth.uid())));

-- Add comment to document the table purpose
COMMENT ON TABLE public.window_types IS 'Window type definitions with visual configurations and measurement fields for dynamic rendering';