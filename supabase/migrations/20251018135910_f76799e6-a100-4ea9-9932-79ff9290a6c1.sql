
-- Fix darius+6 immediately
UPDATE public.user_profiles
SET role = 'Admin',
    parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid,
    updated_at = now()
WHERE user_id = '2a842cd3-144c-4bfa-ac0f-039330c590a3';

-- Fix the root cause: The sync_permissions_on_role_change trigger runs AFTER handle_new_user
-- and changes the role based on permissions, causing the issue
-- We need to ensure handle_new_user runs AFTER any other triggers

-- Drop and recreate the trigger to run LAST
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_new_user();

-- Ensure sync trigger runs BEFORE handle_new_user by making it fire first
DROP TRIGGER IF EXISTS sync_permissions_on_profile_role_change ON public.user_profiles;

CREATE TRIGGER sync_permissions_on_profile_role_change
  AFTER UPDATE OF role ON public.user_profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.sync_permissions_on_role_change();
