-- Create permission audit log table
CREATE TABLE public.permission_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  previous_value BOOLEAN,
  new_value BOOLEAN,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Users can view audit logs for users they manage" 
ON public.permission_audit_log 
FOR SELECT 
USING (
  target_user_id = auth.uid() OR 
  has_permission('manage_users')
);

CREATE POLICY "System can insert audit logs" 
ON public.permission_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create function to validate permission dependencies
CREATE OR REPLACE FUNCTION public.validate_permission_dependencies(
  user_id_param UUID,
  permissions_param TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Create function to log permission changes
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.permission_audit_log (
      user_id, 
      target_user_id, 
      permission_name, 
      action, 
      previous_value, 
      new_value,
      created_by
    ) VALUES (
      auth.uid(),
      NEW.user_id,
      NEW.permission_name,
      'granted',
      false,
      true,
      NEW.created_by
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.permission_audit_log (
      user_id,
      target_user_id,
      permission_name,
      action,
      previous_value,
      new_value,
      created_by
    ) VALUES (
      auth.uid(),
      OLD.user_id,
      OLD.permission_name,
      'revoked',
      true,
      false,
      auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for permission audit logging
CREATE TRIGGER permission_audit_trigger
  AFTER INSERT OR DELETE ON public.user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_permission_change();

-- Update the has_permission function to include role-based fallback
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
  role_permissions TEXT[];
BEGIN
  -- First check for custom permissions
  IF EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = $1
  ) THEN
    RETURN true;
  END IF;
  
  -- If no custom permissions, check role-based permissions
  SELECT role INTO user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
  
  IF user_role IS NOT NULL THEN
    role_permissions := public.get_default_permissions_for_role(user_role);
    RETURN permission_name = ANY(role_permissions);
  END IF;
  
  -- Admin override
  RETURN public.is_admin();
END;
$$;