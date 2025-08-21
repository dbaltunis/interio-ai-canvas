-- Fix the audit log trigger and run manual acceptance

-- Fix the log_permission_change function to handle null auth.uid() 
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID, fallback to granted_by if auth.uid() is null
  current_user_id := COALESCE(auth.uid(), NEW.granted_by, OLD.granted_by);
  
  IF TG_OP = 'INSERT' THEN
    -- Only log if we have a valid user ID
    IF current_user_id IS NOT NULL THEN
      INSERT INTO public.permission_audit_log (
        user_id, 
        target_user_id, 
        permission_name, 
        action, 
        previous_value, 
        new_value,
        created_by
      ) VALUES (
        current_user_id,
        NEW.user_id,
        NEW.permission_name,
        'granted',
        false,
        true,
        COALESCE(NEW.granted_by, current_user_id)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only log if we have a valid user ID
    IF current_user_id IS NOT NULL THEN
      INSERT INTO public.permission_audit_log (
        user_id,
        target_user_id,
        permission_name,
        action,
        previous_value,
        new_value,
        created_by
      ) VALUES (
        current_user_id,
        OLD.user_id,
        OLD.permission_name,
        'revoked',
        true,
        false,
        COALESCE(OLD.granted_by, current_user_id)
      );
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Re-enable the trigger
CREATE TRIGGER log_permission_changes
  AFTER INSERT OR DELETE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_permission_change();

-- Now manually fix the pending invitation for the specific user
DO $$
DECLARE
  holly_user_id uuid;
  invitation_token_val uuid;
BEGIN
  -- Get the user ID for the Holly email
  SELECT id INTO holly_user_id FROM auth.users WHERE email = 'darius+holly@curtainscalculator.com';
  
  -- Get the invitation token
  SELECT invitation_token INTO invitation_token_val 
  FROM public.user_invitations 
  WHERE invited_email = 'darius+holly@curtainscalculator.com' 
    AND status = 'pending' 
    AND expires_at > now()
  LIMIT 1;
  
  -- If both exist, accept the invitation
  IF holly_user_id IS NOT NULL AND invitation_token_val IS NOT NULL THEN
    PERFORM public.accept_user_invitation(invitation_token_val::text, holly_user_id);
    RAISE NOTICE 'Accepted invitation for Holly user: %', holly_user_id;
  ELSE
    RAISE NOTICE 'Could not find user or invitation for Holly. User ID: %, Token: %', holly_user_id, invitation_token_val;
  END IF;
END $$;