-- Fix ambiguous column references with proper aliases

CREATE OR REPLACE FUNCTION public.fix_user_permissions_for_role(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_role text;
    expected_perms text[];
    existing_perms text[];
    missing_perms text[];
    perm_to_add text;
    permissions_added int := 0;
    inviter_id uuid;
BEGIN
    -- Get user's role and parent account
    SELECT up.role, up.parent_account_id INTO user_role, inviter_id
    FROM public.user_profiles up
    WHERE up.user_id = target_user_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Get expected permissions for role
    expected_perms := public.get_default_permissions_for_role(user_role);
    
    -- Get existing permissions using explicit table alias
    SELECT array_agg(uper.permission_name) INTO existing_perms
    FROM public.user_permissions uper
    WHERE uper.user_id = target_user_id;
    
    existing_perms := COALESCE(existing_perms, ARRAY[]::text[]);
    
    -- Find missing permissions
    SELECT array_agg(expected_perm) INTO missing_perms
    FROM unnest(expected_perms) AS expected_perm
    WHERE expected_perm != ALL(existing_perms);
    
    missing_perms := COALESCE(missing_perms, ARRAY[]::text[]);
    
    -- Add missing permissions
    FOREACH perm_to_add IN ARRAY missing_perms LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
        VALUES (target_user_id, perm_to_add, inviter_id)
        ON CONFLICT (user_id, permission_name) DO NOTHING;
        permissions_added := permissions_added + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_role', user_role,
        'expected_permissions', expected_perms,
        'existing_permissions', existing_perms,
        'missing_permissions', missing_perms,
        'permissions_added', permissions_added
    );
END;
$$;

-- Apply fixes to all existing users with roles
DO $$
DECLARE
    user_record record;
    fix_result jsonb;
BEGIN
    FOR user_record IN 
        SELECT up.user_id, up.role, up.parent_account_id 
        FROM public.user_profiles up
        WHERE up.role IS NOT NULL 
        AND up.role != 'User'
    LOOP
        SELECT public.fix_user_permissions_for_role(user_record.user_id) INTO fix_result;
        
        RAISE NOTICE 'Fixed permissions for user % with role %: added % permissions', 
            user_record.user_id, user_record.role, (fix_result->>'permissions_added')::int;
    END LOOP;
END $$;

-- Create role change sync trigger with proper variable names
CREATE OR REPLACE FUNCTION public.sync_permissions_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    expected_perms text[];
    perm_to_add text;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
        RAISE LOG 'Role changed for user % from % to %', NEW.user_id, OLD.role, NEW.role;
        
        expected_perms := public.get_default_permissions_for_role(NEW.role);
        
        DELETE FROM public.user_permissions WHERE user_id = NEW.user_id;
        
        IF expected_perms IS NOT NULL THEN
            FOREACH perm_to_add IN ARRAY expected_perms LOOP
                INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                VALUES (NEW.user_id, perm_to_add, NEW.parent_account_id)
                ON CONFLICT (user_id, permission_name) DO NOTHING;
            END LOOP;
        END IF;
        
        RAISE LOG 'Synced permissions for user % to role %', NEW.user_id, NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_permissions_on_role_change ON public.user_profiles;
CREATE TRIGGER sync_permissions_on_role_change
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_permissions_on_role_change();