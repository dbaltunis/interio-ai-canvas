-- Apply the generic fix to all existing users and create auto-sync system

-- Fix permissions for all existing users who might have incomplete permissions
DO $$
DECLARE
    user_record record;
    fix_result jsonb;
BEGIN
    -- Loop through all users with roles who might have incomplete permissions
    FOR user_record IN 
        SELECT user_id, role, parent_account_id 
        FROM public.user_profiles 
        WHERE role IS NOT NULL 
        AND role != 'User'
    LOOP
        -- Fix permissions for each user
        SELECT public.fix_user_permissions_for_role(user_record.user_id) INTO fix_result;
        
        RAISE NOTICE 'Fixed permissions for user % with role %: %', 
            user_record.user_id, user_record.role, fix_result;
    END LOOP;
END $$;

-- Create a trigger function to automatically sync permissions when user role changes
CREATE OR REPLACE FUNCTION public.sync_permissions_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    expected_perms text[];
    perm text;
BEGIN
    -- Only proceed if role actually changed
    IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
        RAISE LOG 'Role changed for user % from % to %', NEW.user_id, OLD.role, NEW.role;
        
        -- Get expected permissions for the new role
        expected_perms := public.get_default_permissions_for_role(NEW.role);
        
        -- Clear existing permissions
        DELETE FROM public.user_permissions WHERE user_id = NEW.user_id;
        
        -- Add new role-based permissions
        IF expected_perms IS NOT NULL THEN
            FOREACH perm IN ARRAY expected_perms LOOP
                INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                VALUES (NEW.user_id, perm, NEW.parent_account_id)
                ON CONFLICT (user_id, permission_name) DO NOTHING;
            END LOOP;
        END IF;
        
        RAISE LOG 'Synced permissions for user % to role %', NEW.user_id, NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger to automatically sync permissions on role change
DROP TRIGGER IF EXISTS sync_permissions_on_role_change ON public.user_profiles;
CREATE TRIGGER sync_permissions_on_role_change
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_permissions_on_role_change();

-- Ensure all account settings and business settings inheritance works for any account structure
CREATE OR REPLACE FUNCTION public.get_inherited_account_settings(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_settings jsonb;
    parent_settings jsonb;
    account_owner_id uuid;
BEGIN
    -- Try to get user's own account settings first
    SELECT row_to_json(account_settings)::jsonb INTO user_settings
    FROM public.account_settings
    WHERE account_owner_id = user_id_param;
    
    -- If no settings found, get parent account settings
    IF user_settings IS NULL THEN
        SELECT public.get_account_owner(user_id_param) INTO account_owner_id;
        
        IF account_owner_id != user_id_param THEN
            SELECT row_to_json(account_settings)::jsonb INTO parent_settings
            FROM public.account_settings
            WHERE account_owner_id = account_owner_id;
            
            user_settings := parent_settings;
        END IF;
    END IF;
    
    RETURN COALESCE(user_settings, '{}'::jsonb);
END;
$$;

-- Create similar function for business settings inheritance
CREATE OR REPLACE FUNCTION public.get_inherited_business_settings(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_settings jsonb;
    parent_settings jsonb;
    account_owner_id uuid;
BEGIN
    -- Try to get user's own business settings first
    SELECT row_to_json(business_settings)::jsonb INTO user_settings
    FROM public.business_settings
    WHERE user_id = user_id_param;
    
    -- If no settings found, get parent account settings
    IF user_settings IS NULL THEN
        SELECT public.get_account_owner(user_id_param) INTO account_owner_id;
        
        IF account_owner_id != user_id_param THEN
            SELECT row_to_json(business_settings)::jsonb INTO parent_settings
            FROM public.business_settings
            WHERE user_id = account_owner_id;
            
            user_settings := parent_settings;
        END IF;
    END IF;
    
    RETURN COALESCE(user_settings, '{}'::jsonb);
END;
$$;