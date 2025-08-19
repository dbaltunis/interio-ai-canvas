-- Fix the check constraint to allow 'updated' action
ALTER TABLE public.permission_audit_log 
DROP CONSTRAINT IF EXISTS permission_audit_log_action_check;

ALTER TABLE public.permission_audit_log 
ADD CONSTRAINT permission_audit_log_action_check 
CHECK (action = ANY (ARRAY['granted'::text, 'revoked'::text, 'updated'::text]));

-- Drop the problematic trigger completely
DROP TRIGGER IF EXISTS log_permission_changes ON user_permissions;
DROP FUNCTION IF EXISTS log_permission_change();

-- Manually set parent_account_id for the Staff user who can't see data
UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid,
    updated_at = now()
WHERE user_id = '4ade6053-9634-44dc-b2e0-4459761945ca'::uuid
AND parent_account_id IS NULL;

-- Give the Staff user their default permissions directly
INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
VALUES 
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'view_jobs', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'create_jobs', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'view_clients', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'create_clients', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'view_calendar', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'view_inventory', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid),
    ('4ade6053-9634-44dc-b2e0-4459761945ca'::uuid, 'view_profile', 'ec930f73-ef23-4430-921f-1b401859825d'::uuid)
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Recreate the log_permission_change function with correct column references
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      COALESCE(auth.uid(), NEW.granted_by),
      NEW.user_id,
      NEW.permission_name,
      'granted',
      false,
      true,
      NEW.granted_by
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
      COALESCE(auth.uid(), OLD.granted_by),
      OLD.user_id,
      OLD.permission_name,
      'revoked',
      true,
      false,
      COALESCE(auth.uid(), OLD.granted_by)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Re-enable the trigger
CREATE TRIGGER log_permission_changes
AFTER INSERT OR DELETE ON user_permissions
FOR EACH ROW EXECUTE FUNCTION log_permission_change();