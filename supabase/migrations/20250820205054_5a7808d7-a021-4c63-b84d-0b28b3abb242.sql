-- Fix all functions that might have ambiguous target_user_id references

-- First, let's recreate the log_permission_change function to avoid ambiguity
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS trigger
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

-- Also fix the log_role_changes function
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.permission_audit_log (
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

-- Let's also simplify the delete function to avoid any potential issues
CREATE OR REPLACE FUNCTION delete_user_cascade(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user has permission to delete users
  IF NOT has_permission('manage_users') THEN
    RAISE EXCEPTION 'Insufficient permissions to delete users';
  END IF;

  -- Prevent deleting account owner
  IF user_id_param = get_account_owner(user_id_param) THEN
    RAISE EXCEPTION 'Cannot delete account owner';
  END IF;

  -- Delete related records first
  DELETE FROM user_permissions WHERE user_id = user_id_param;
  DELETE FROM permission_audit_log WHERE target_user_id = user_id_param OR user_id = user_id_param;
  DELETE FROM user_invitations WHERE user_id = user_id_param;
  
  -- Mark any invitations sent to this user's email as expired
  UPDATE user_invitations 
  SET status = 'expired', updated_at = now()
  WHERE invited_email = (SELECT email FROM auth.users WHERE id = user_id_param)
    AND status = 'pending';
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_id = user_id_param;
END;
$$;