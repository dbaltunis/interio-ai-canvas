-- Manually fix the parent_account_id for users who should be linked to the main account
-- The main account owner appears to be ec930f73-ef23-4430-921f-1b401859825d based on user_invitations

UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d',
    updated_at = now()
WHERE user_id IN (
    '4ade6053-9634-44dc-b2e0-4459761945ca', -- darius+holly@curtainscalculator.com
    '83e0e4e0-2a17-4623-b53e-ea2904507985', -- baltunis+testing2@curtainscalculator.com
    '4210c6ae-1e8d-4043-89e2-900bfd64d81e', -- baltunis+testing@curtainscalculator.com
    'f74cb202-6f65-4a73-acef-67f043f6f05e'  -- thomas@curtainscalculator.com
)
AND parent_account_id IS NULL;

-- Seed permissions for users without permissions
INSERT INTO public.user_permissions (user_id, permission_name, created_by)
SELECT DISTINCT 
    up.user_id,
    perm.permission_name,
    'ec930f73-ef23-4430-921f-1b401859825d'
FROM public.user_profiles up
CROSS JOIN (
    SELECT unnest(public.get_default_permissions_for_role('Staff')) as permission_name
) perm
WHERE up.parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND up.user_id NOT IN (
    SELECT DISTINCT user_id FROM public.user_permissions WHERE user_id = up.user_id
)
ON CONFLICT (user_id, permission_name) DO NOTHING;