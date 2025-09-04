-- Insert basic window types for current user with existing table structure
DO $$
DECLARE
    current_user_id uuid := 'ec930f73-ef23-4430-921f-1b401859825d'::uuid; -- From logs
BEGIN
    -- Clear existing and insert new window types for current user
    DELETE FROM public.window_types WHERE org_id = current_user_id;
    
    INSERT INTO public.window_types (org_id, key, name, visual_key)
    VALUES 
        (current_user_id, 'standard', 'Standard Window', 'standard'),
        (current_user_id, 'bay', 'Bay Window', 'bay'),
        (current_user_id, 'french_doors', 'French Doors', 'french_doors'),
        (current_user_id, 'sliding_doors', 'Sliding Doors', 'sliding_doors');
    
    RAISE LOG 'Inserted % window types for user %', 4, current_user_id;
END $$;