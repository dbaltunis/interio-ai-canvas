-- Fix validate_permission_dependencies to use actual permissions instead of aliases
-- The function was checking for alias permissions like 'view_jobs' which don't exist
-- as actual permissions. We need to check for the real permissions instead.

CREATE OR REPLACE FUNCTION public.validate_permission_dependencies(user_id_param uuid, permissions_param text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  dependency_map JSONB := '{
    "create_jobs": ["view_all_jobs", "view_assigned_jobs"],
    "delete_jobs": ["view_all_jobs", "view_assigned_jobs"],
    "create_clients": ["view_all_clients", "view_assigned_clients"],
    "delete_clients": ["view_all_clients", "view_assigned_clients"],
    "create_appointments": ["view_all_calendar", "view_own_calendar"],
    "delete_appointments": ["view_all_calendar", "view_own_calendar"],
    "manage_inventory": ["view_inventory"],
    "manage_window_treatments": ["view_templates", "view_inventory"],
    "manage_settings": ["view_settings"]
  }';
  permission TEXT;
  required_permissions TEXT[];
  missing_deps TEXT[] := '{}';
  result JSONB;
  has_required BOOLEAN;
BEGIN
  -- Check each permission for dependencies
  FOREACH permission IN ARRAY permissions_param
  LOOP
    IF dependency_map ? permission THEN
      required_permissions := ARRAY(SELECT jsonb_array_elements_text(dependency_map->permission));
      
      -- Check if at least one of the required permissions is present (OR logic)
      -- This handles cases like create_jobs requiring view_all_jobs OR view_assigned_jobs
      has_required := false;
      FOR i IN 1..array_length(required_permissions, 1)
      LOOP
        IF required_permissions[i] = ANY(permissions_param) THEN
          has_required := true;
          EXIT;
        END IF;
      END LOOP;
      
      -- If none of the required permissions are present, mark this permission as missing dependency
      IF NOT has_required THEN
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

