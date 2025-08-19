-- Fix all existing users who were invited but have missing parent_account_id or permissions

-- First, set the correct parent_account_id for all users who don't have one
-- The owner account is ec930f73-ef23-4430-921f-1b401859825d
UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid,
    updated_at = now()
WHERE parent_account_id IS NULL 
    AND user_id != 'ec930f73-ef23-4430-921f-1b401859825d'::uuid; -- Don't change the owner

-- Clear all existing permissions for users who have wrong permissions
DELETE FROM public.user_permissions 
WHERE user_id IN (
    SELECT user_id FROM public.user_profiles 
    WHERE parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid
    AND user_id != 'ec930f73-ef23-4430-921f-1b401859825d'::uuid
);

-- Grant correct Staff permissions to all staff users
INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
SELECT 
    up.user_id,
    perm.permission_name,
    'ec930f73-ef23-4430-921f-1b401859825d'::uuid as granted_by
FROM public.user_profiles up
CROSS JOIN (
    VALUES 
        ('view_jobs'),
        ('create_jobs'),
        ('view_clients'), 
        ('create_clients'),
        ('view_calendar'),
        ('view_inventory'),
        ('view_profile')
) AS perm(permission_name)
WHERE up.role = 'Staff' 
    AND up.parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid
    AND up.user_id != 'ec930f73-ef23-4430-921f-1b401859825d'::uuid
ON CONFLICT (user_id, permission_name) DO NOTHING;