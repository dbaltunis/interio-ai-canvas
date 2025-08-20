-- Fix the log_permission_change trigger function to work with the correct column name

CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
      COALESCE(NEW.granted_by, auth.uid())  -- Use granted_by if available, otherwise auth.uid()
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
      COALESCE(OLD.granted_by, auth.uid())  -- Use granted_by if available, otherwise auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;