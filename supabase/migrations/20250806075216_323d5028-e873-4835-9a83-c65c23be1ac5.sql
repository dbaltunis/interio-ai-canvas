-- Fix the has_permission function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
  role_permissions TEXT[];
BEGIN
  -- First check for custom permissions
  IF EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = auth.uid() 
    AND user_permissions.permission_name = $1
  ) THEN
    RETURN true;
  END IF;
  
  -- If no custom permissions, check role-based permissions
  SELECT role INTO user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
  
  IF user_role IS NOT NULL THEN
    role_permissions := public.get_default_permissions_for_role(user_role);
    RETURN $1 = ANY(role_permissions);
  END IF;
  
  -- Admin override
  RETURN public.is_admin();
END;
$function$;

-- Fix the validate_permission_dependencies function to avoid ambiguous references
CREATE OR REPLACE FUNCTION public.validate_permission_dependencies(user_id_param uuid, permissions_param text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  dependency_map JSONB := '{
    "create_jobs": ["view_jobs"],
    "delete_jobs": ["view_jobs"],
    "create_clients": ["view_clients"],
    "delete_clients": ["view_clients"],
    "create_appointments": ["view_calendar"],
    "delete_appointments": ["view_calendar"],
    "manage_inventory": ["view_inventory"],
    "manage_window_treatments": ["view_window_treatments"],
    "manage_settings": ["view_settings"]
  }';
  permission TEXT;
  required_permissions TEXT[];
  missing_deps TEXT[] := '{}';
  result JSONB;
BEGIN
  -- Check each permission for dependencies
  FOREACH permission IN ARRAY permissions_param
  LOOP
    IF dependency_map ? permission THEN
      required_permissions := ARRAY(SELECT jsonb_array_elements_text(dependency_map->permission));
      
      -- Check if all required permissions are present
      IF NOT (required_permissions <@ permissions_param) THEN
        missing_deps := missing_deps || ARRAY[permission];
      END IF;
    END IF;
  END LOOP;
  
  -- Return validation result
  result := jsonb_build_object(
    'valid', array_length(missing_deps, 1) IS NULL,
    'missing_dependencies', missing_deps,
    'user_id', user_id_param
  );
  
  RETURN result;
END;
$function$;