-- Fix security definer function search paths

-- Update existing functions to have proper search path
CREATE OR REPLACE FUNCTION validate_role_hierarchy(current_user_id uuid, target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM user_profiles 
  WHERE user_id = current_user_id;
  
  -- Get target user's current role
  SELECT role INTO target_user_role 
  FROM user_profiles 
  WHERE user_id = target_user_id;
  
  -- Only Owner can modify Owner/Admin roles
  IF (new_role IN ('Owner', 'Admin') OR target_user_role IN ('Owner', 'Admin')) 
     AND current_user_role != 'Owner' THEN
    RETURN false;
  END IF;
  
  -- Admin can modify Manager/Staff roles
  IF current_user_role IN ('Owner', 'Admin') 
     AND new_role IN ('Manager', 'Staff', 'User') THEN
    RETURN true;
  END IF;
  
  -- Users can only modify themselves (non-privileged roles)
  IF current_user_id = target_user_id 
     AND new_role IN ('User') 
     AND target_user_role IN ('User') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO permission_audit_log (
      user_id,
      target_user_id,
      permission_name,
      action,
      previous_value,
      new_value,
      reason,
      created_by
    ) VALUES (
      auth.uid(),
      NEW.user_id,
      'role_change',
      'updated',
      false,
      true,
      format('Role changed from %s to %s', OLD.role, NEW.role),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;