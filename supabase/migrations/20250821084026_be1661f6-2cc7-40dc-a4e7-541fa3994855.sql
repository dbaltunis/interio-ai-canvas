-- Fix Manager role permissions and account settings inheritance

-- Update Manager role permissions to include view_all_* permissions
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
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
        'view_profile'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs',
        'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings',
        'view_profile'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'view_all_jobs',
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

-- Update Holly's permissions to include the missing view_all_* permissions
DO $$
DECLARE
  holly_user_id uuid;
  missing_perms text[] := ARRAY['view_all_jobs', 'view_all_clients'];
  perm text;
BEGIN
  -- Get Holly's user ID
  SELECT id INTO holly_user_id FROM auth.users WHERE email = 'darius+holly@curtainscalculator.com';
  
  IF holly_user_id IS NOT NULL THEN
    -- Add missing permissions
    FOREACH perm IN ARRAY missing_perms
    LOOP
      INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
      VALUES (holly_user_id, perm, (SELECT id FROM auth.users WHERE email = 'darius@curtainscalculator.com'))
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Updated permissions for Holly user: %', holly_user_id;
  ELSE
    RAISE NOTICE 'Holly user not found';
  END IF;
END $$;

-- Update clients RLS policy to allow managers to see account owner's clients
DROP POLICY IF EXISTS "Users can view account clients" ON public.clients;
CREATE POLICY "Users can view account clients" ON public.clients
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id)) 
  AND (has_permission('view_clients') OR has_permission('view_all_clients') OR is_admin())
);

-- Update projects RLS policy to allow managers to see account owner's projects  
CREATE POLICY "Users can view account projects" ON public.projects
FOR SELECT
USING (
  (get_account_owner(auth.uid()) = get_account_owner(user_id))
  AND (has_permission('view_jobs') OR has_permission('view_all_jobs') OR is_admin())
);