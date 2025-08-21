-- Ensure projects RLS policy exists and is correct
DROP POLICY IF EXISTS "Users can view account projects" ON public.projects;
CREATE POLICY "Users can view account projects" ON public.projects
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_jobs') OR has_permission('view_all_jobs') OR is_admin())
);

-- Also ensure we have the missing "view_all_projects" permission check
-- Since some hooks might still reference view_all_projects
-- Let's add it to the Manager role for compatibility
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
        'view_analytics',
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

-- Re-run the permission fix for all users to pick up the new view_all_projects permission
DO $$
DECLARE
    user_record record;
    fix_result jsonb;
BEGIN
    FOR user_record IN 
        SELECT up.user_id, up.role
        FROM public.user_profiles up
        WHERE up.role IN ('Owner', 'Admin', 'Manager')
    LOOP
        SELECT public.fix_user_permissions_for_role(user_record.user_id) INTO fix_result;
        
        IF (fix_result->>'permissions_added')::int > 0 THEN
            RAISE NOTICE 'Added % additional permissions for % user %', 
                (fix_result->>'permissions_added')::int, user_record.role, user_record.user_id;
        END IF;
    END LOOP;
END $$;