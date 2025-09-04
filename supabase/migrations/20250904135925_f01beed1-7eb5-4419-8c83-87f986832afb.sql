-- Add missing columns to window_types table for Phase 1
ALTER TABLE public.window_types 
ADD COLUMN IF NOT EXISTS configurations JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS measurement_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Insert default window types using simple insert
DO $$
DECLARE
    owner_user_id uuid;
BEGIN
    -- Get the first owner user_id
    SELECT user_id INTO owner_user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1;
    
    -- Only insert if we have an owner and the records don't already exist
    IF owner_user_id IS NOT NULL THEN
        -- Standard Window
        IF NOT EXISTS (SELECT 1 FROM public.window_types WHERE key = 'standard' AND org_id = owner_user_id) THEN
            INSERT INTO public.window_types (org_id, key, name, visual_key, description, configurations, measurement_fields, sort_order)
            VALUES (owner_user_id, 'standard', 'Standard Window', 'standard', 'Regular rectangular window with standard measurements', '{"default_hardware": "rod", "common_treatments": ["curtains", "blinds"]}', '[{"name": "width", "label": "Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}]', 1);
        END IF;
        
        -- Bay Window
        IF NOT EXISTS (SELECT 1 FROM public.window_types WHERE key = 'bay' AND org_id = owner_user_id) THEN
            INSERT INTO public.window_types (org_id, key, name, visual_key, description, configurations, measurement_fields, sort_order)
            VALUES (owner_user_id, 'bay', 'Bay Window', 'bay', 'Three-panel bay window requiring special measurements', '{"default_hardware": "track", "common_treatments": ["curtains"], "panels": 3}', '[{"name": "center_width", "label": "Center Width", "type": "number", "required": true}, {"name": "side_width", "label": "Side Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}, {"name": "angle", "label": "Bay Angle", "type": "number", "default": 45}]', 2);
        END IF;
        
        -- French Doors
        IF NOT EXISTS (SELECT 1 FROM public.window_types WHERE key = 'french_doors' AND org_id = owner_user_id) THEN
            INSERT INTO public.window_types (org_id, key, name, visual_key, description, configurations, measurement_fields, sort_order)
            VALUES (owner_user_id, 'french_doors', 'French Doors', 'french_doors', 'Double French doors with glass panels', '{"default_hardware": "rod", "common_treatments": ["curtains"], "panels": 2}', '[{"name": "door_width", "label": "Door Width", "type": "number", "required": true}, {"name": "door_height", "label": "Door Height", "type": "number", "required": true}, {"name": "gap_width", "label": "Gap Between Doors", "type": "number", "default": 2}]', 3);
        END IF;
    END IF;
END $$;

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