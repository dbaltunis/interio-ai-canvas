-- Insert window types using account owner system
DO $$
DECLARE
    account_owner_id uuid;
BEGIN
    -- Get account owner for current user
    SELECT get_account_owner('ec930f73-ef23-4430-921f-1b401859825d'::uuid) INTO account_owner_id;
    
    -- If no account owner found, use the user as their own account owner
    IF account_owner_id IS NULL THEN
        account_owner_id := 'ec930f73-ef23-4430-921f-1b401859825d'::uuid;
    END IF;
    
    RAISE LOG 'Using account owner: %', account_owner_id;
    
    -- Insert window types for this account
    INSERT INTO public.window_types (org_id, key, name, visual_key)
    VALUES 
        (account_owner_id, 'standard', 'Standard Window', 'standard'),
        (account_owner_id, 'bay', 'Bay Window', 'bay'),
        (account_owner_id, 'french_doors', 'French Doors', 'french_doors'),
        (account_owner_id, 'sliding_doors', 'Sliding Doors', 'sliding_doors')
    ON CONFLICT (org_id, key) DO UPDATE SET
        name = EXCLUDED.name,
        visual_key = EXCLUDED.visual_key;
    
    RAISE LOG 'Successfully inserted/updated window types for account %', account_owner_id;
END $$;