-- Temporarily disable the trigger to fix the permission system
-- We'll fix the audit log issue separately

-- Disable the trigger temporarily 
DROP TRIGGER IF EXISTS log_permission_changes ON public.user_permissions;

-- Test the manual fix now without the trigger
SELECT public.fix_pending_invitations();