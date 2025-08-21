-- Add missing view_settings permission for managers
DO $$
DECLARE
    manager_users record;
    perm_to_add text := 'view_settings';
BEGIN
    -- Add view_settings to all Manager role users who don't have it
    FOR manager_users IN 
        SELECT up.user_id, up.parent_account_id
        FROM public.user_profiles up
        WHERE up.role = 'Manager'
        AND up.user_id NOT IN (
            SELECT uper.user_id 
            FROM public.user_permissions uper 
            WHERE uper.permission_name = 'view_settings'
        )
    LOOP
        INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
        VALUES (manager_users.user_id, perm_to_add, manager_users.parent_account_id)
        ON CONFLICT (user_id, permission_name) DO NOTHING;
        
        RAISE NOTICE 'Added view_settings permission to Manager user: %', manager_users.user_id;
    END LOOP;
END $$;

-- Update the Manager role definition to include view_settings (it was missing)
CREATE OR REPLACE FUNCTION public.get_default_permissions_for_role(user_role text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  CASE user_role
    WHEN 'Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
        'view_profile'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'view_all_jobs', 'view_all_projects',
        'view_clients', 'create_clients', 'view_all_clients',
        'view_calendar', 'create_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_calendar',
        'view_inventory',
        'view_profile'
      ];
    ELSE
      RETURN ARRAY['view_profile']::text[];
  END CASE;
END;
$$;