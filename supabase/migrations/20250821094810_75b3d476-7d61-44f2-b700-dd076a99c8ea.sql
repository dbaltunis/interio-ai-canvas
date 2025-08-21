-- Final cleanup and verification for the generic user management system

-- Run a final permission fix for all existing users to ensure everything is in sync
DO $$
DECLARE
    user_record record;
    fix_result jsonb;
    permissions_added int;
BEGIN
    -- Fix permissions for all users with roles
    FOR user_record IN 
        SELECT up.user_id, up.role
        FROM public.user_profiles up
        WHERE up.role IS NOT NULL
    LOOP
        SELECT public.fix_user_permissions_for_role(user_record.user_id) INTO fix_result;
        permissions_added := (fix_result->>'permissions_added')::int;
        
        IF permissions_added > 0 THEN
            RAISE NOTICE 'Final sync: Added % permissions for % user %', 
                permissions_added, user_record.role, user_record.user_id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Final permission synchronization completed for all users';
END $$;

-- Create a maintenance function that can be called periodically to ensure system health
CREATE OR REPLACE FUNCTION public.maintain_user_management_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    users_fixed int := 0;
    users_checked int := 0;
    user_record record;
    fix_result jsonb;
    permissions_added int;
    result jsonb;
BEGIN
    -- Check and fix all users with roles
    FOR user_record IN 
        SELECT up.user_id, up.role, up.parent_account_id
        FROM public.user_profiles up
        WHERE up.role IS NOT NULL
    LOOP
        users_checked := users_checked + 1;
        
        SELECT public.fix_user_permissions_for_role(user_record.user_id) INTO fix_result;
        permissions_added := COALESCE((fix_result->>'permissions_added')::int, 0);
        
        IF permissions_added > 0 THEN
            users_fixed := users_fixed + 1;
        END IF;
    END LOOP;
    
    result := jsonb_build_object(
        'users_checked', users_checked,
        'users_fixed', users_fixed,
        'timestamp', now(),
        'success', true
    );
    
    RETURN result;
END;
$$;

-- Ensure Holly specifically has all the right permissions 
-- (This will be our test case to verify the system works generically)
DO $$
DECLARE
    holly_user_id uuid;
    fix_result jsonb;
BEGIN
    SELECT id INTO holly_user_id FROM auth.users WHERE email = 'darius+holly@curtainscalculator.com';
    
    IF holly_user_id IS NOT NULL THEN
        SELECT public.fix_user_permissions_for_role(holly_user_id) INTO fix_result;
        RAISE NOTICE 'Holly permissions fix result: %', fix_result;
    END IF;
END $$;