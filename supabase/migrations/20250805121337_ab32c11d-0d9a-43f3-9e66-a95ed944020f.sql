-- Fix security warnings for function search paths

-- Update get_default_permissions_for_role function to be secure
CREATE OR REPLACE FUNCTION get_default_permissions_for_role(user_role text)
RETURNS text[] 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE user_role
    WHEN 'Owner' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'delete_clients', 
        'view_calendar', 'create_appointments', 'delete_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings', 'manage_settings', 'manage_users'
      ];
    WHEN 'Admin' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs', 'delete_jobs',
        'view_clients', 'create_clients', 'delete_clients',
        'view_calendar', 'create_appointments', 'delete_appointments', 
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics', 'view_settings'
      ];
    WHEN 'Manager' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients',
        'view_calendar', 'create_appointments',
        'view_inventory', 'manage_inventory',
        'view_window_treatments', 'manage_window_treatments',
        'view_analytics'
      ];
    WHEN 'Staff' THEN
      RETURN ARRAY[
        'view_jobs', 'create_jobs',
        'view_clients', 'create_clients', 
        'view_calendar',
        'view_inventory'
      ];
    ELSE
      RETURN ARRAY[]::text[];
  END CASE;
END;
$$;

-- Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('Admin', 'Owner', 'Manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = $1
  ) OR public.is_admin();
$$;