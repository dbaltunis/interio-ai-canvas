-- Comprehensive update: Allow System Owner role in all validation functions

-- 1. Update validate_parent_account_id function
CREATE OR REPLACE FUNCTION public.validate_parent_account_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only validate for non-Owner and non-System Owner users
    IF NEW.role NOT IN ('Owner', 'System Owner') AND NEW.parent_account_id IS NULL THEN
        RAISE EXCEPTION 'parent_account_id cannot be NULL for non-Owner users (role: %)', NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2. Update validate_user_profile_parent function  
CREATE OR REPLACE FUNCTION public.validate_user_profile_parent()
RETURNS TRIGGER AS $$
BEGIN
  -- Owner and System Owner users can have NULL parent_account_id
  IF NEW.role IN ('Owner', 'System Owner') THEN
    RETURN NEW;
  END IF;
  
  -- For INSERT operations, allow NULL temporarily if this is initial user creation
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- For UPDATE operations, enforce parent_account_id for non-owner roles
  IF NEW.parent_account_id IS NULL THEN
    RAISE EXCEPTION 'Non-owner users must have a valid parent_account_id. User role: %', NEW.role;
  END IF;
  
  IF NEW.parent_account_id = NEW.user_id THEN
    RAISE EXCEPTION 'Users cannot be their own parent. User: %, Parent: %', NEW.user_id, NEW.parent_account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update the user role for baltunis@curtainscalculator.com to System Owner
UPDATE public.user_roles 
SET role = 'System Owner' 
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d';