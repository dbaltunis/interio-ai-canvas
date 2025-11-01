-- Phase 1: Critical Security Fix - Migrate to user_roles table
-- Populate missing entries in user_roles from user_profiles

-- First, create a function to safely sync roles
CREATE OR REPLACE FUNCTION sync_user_role_from_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert missing role entries from user_profiles to user_roles
  INSERT INTO user_roles (user_id, role)
  SELECT 
    up.user_id, 
    up.role::app_role
  FROM user_profiles up
  LEFT JOIN user_roles ur ON up.user_id = ur.user_id
  WHERE ur.user_id IS NULL 
    AND up.role IS NOT NULL
    AND up.role IN ('Owner', 'Admin', 'Manager', 'Staff', 'User')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Run the sync to populate missing entries
SELECT sync_user_role_from_profile();

-- Create secure function to get user role
CREATE OR REPLACE FUNCTION get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create secure function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create trigger to keep user_profiles.role in sync with user_roles (temporary during migration)
CREATE OR REPLACE FUNCTION sync_profile_role_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When user_roles changes, update user_profiles.role
  UPDATE user_profiles
  SET role = NEW.role::text
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role sync
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON user_roles;
CREATE TRIGGER sync_profile_role_trigger
AFTER INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_role_on_role_change();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_role_from_profile() TO authenticated;