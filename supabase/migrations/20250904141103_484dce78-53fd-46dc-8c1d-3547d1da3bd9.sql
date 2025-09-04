-- Fix window types for current user and add debugging
DO $$
DECLARE
    current_user_id uuid := auth.uid();
    owner_user_id uuid;
BEGIN
    -- Get current user ID from auth
    RAISE LOG 'Current user ID: %', current_user_id;
    
    -- If we have a user, use them as owner, otherwise get any owner
    IF current_user_id IS NOT NULL THEN
        owner_user_id := current_user_id;
    ELSE
        -- Get any owner user_id as fallback
        SELECT user_id INTO owner_user_id FROM public.user_profiles WHERE role = 'Owner' LIMIT 1;
    END IF;
    
    RAISE LOG 'Using owner user ID: %', owner_user_id;
    
    -- If still no owner, create the records without org_id restriction for now
    IF owner_user_id IS NULL THEN
        -- Use a default org_id for testing
        owner_user_id := '550e8400-e29b-41d4-a716-446655440000'::uuid;
    END IF;
    
    -- Clear any existing window types for this org and recreate
    DELETE FROM public.window_types WHERE org_id = owner_user_id;
    
    -- Insert fresh window types
    INSERT INTO public.window_types (org_id, key, name, visual_key, description, configurations, measurement_fields, sort_order, active)
    VALUES 
        (owner_user_id, 'standard', 'Standard Window', 'standard', 'Regular rectangular window with standard measurements', '{"default_hardware": "rod", "common_treatments": ["curtains", "blinds"]}', '[{"name": "width", "label": "Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}]', 1, true),
        (owner_user_id, 'bay', 'Bay Window', 'bay', 'Three-panel bay window requiring special measurements', '{"default_hardware": "track", "common_treatments": ["curtains"], "panels": 3}', '[{"name": "center_width", "label": "Center Width", "type": "number", "required": true}, {"name": "side_width", "label": "Side Width", "type": "number", "required": true}, {"name": "height", "label": "Height", "type": "number", "required": true}, {"name": "angle", "label": "Bay Angle", "type": "number", "default": 45}]', 2, true),
        (owner_user_id, 'french_doors', 'French Doors', 'french_doors', 'Double French doors with glass panels', '{"default_hardware": "rod", "common_treatments": ["curtains"], "panels": 2}', '[{"name": "door_width", "label": "Door Width", "type": "number", "required": true}, {"name": "door_height", "label": "Door Height", "type": "number", "required": true}, {"name": "gap_width", "label": "Gap Between Doors", "type": "number", "default": 2}]', 3, true),
        (owner_user_id, 'sliding_doors', 'Sliding Doors', 'sliding_doors', 'Large sliding patio doors', '{"default_hardware": "track", "common_treatments": ["curtains", "blinds"]}', '[{"name": "door_width", "label": "Total Width", "type": "number", "required": true}, {"name": "door_height", "label": "Height", "type": "number", "required": true}]', 4, true);
    
    RAISE LOG 'Inserted % window types for org %', 4, owner_user_id;
    
END $$;