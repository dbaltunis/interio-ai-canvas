-- Fix log_role_changes trigger to handle NULL auth.uid() during migrations
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    -- Get current user ID, use parent_account_id as fallback during migrations
    current_user_id := COALESCE(auth.uid(), NEW.parent_account_id, OLD.parent_account_id);
    
    -- Only log if we have a valid user ID
    IF current_user_id IS NOT NULL THEN
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
        current_user_id,
        NEW.user_id,
        'role_change',
        'updated',
        false,
        true,
        format('Role changed from %s to %s', OLD.role, NEW.role),
        current_user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Now fix the broken users
DO $$
DECLARE
  owner_user_id uuid := 'ec930f73-ef23-4430-921f-1b401859825d';
  broken_admin_1 uuid := 'de33894d-5390-4ba9-8adf-b9a5895f2eff';
  broken_staff_1 uuid := '59ca604b-a3cc-47ca-9d9a-7f2945aab19b';
BEGIN
  -- Fix the first broken admin user - set parent and ensure Admin role
  UPDATE user_profiles
  SET 
    parent_account_id = owner_user_id,
    role = 'Admin',
    updated_at = now()
  WHERE user_id = broken_admin_1;
  
  RAISE NOTICE 'Fixed user % - set parent to owner and role to Admin', broken_admin_1;
  
  -- Fix the second broken user - ensure Admin role
  UPDATE user_profiles
  SET 
    role = 'Admin',
    updated_at = now()
  WHERE user_id = broken_staff_1;
  
  RAISE NOTICE 'Fixed user % - set role to Admin', broken_staff_1;
  
  -- Run permission sync for both users to ensure they have Admin permissions
  PERFORM fix_user_permissions_for_role(broken_admin_1);
  PERFORM fix_user_permissions_for_role(broken_staff_1);
  
  RAISE NOTICE 'Synced permissions for both users';
END;
$$;