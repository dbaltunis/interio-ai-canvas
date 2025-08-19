-- Fix the check constraint to allow 'updated' action
ALTER TABLE public.permission_audit_log 
DROP CONSTRAINT permission_audit_log_action_check;

ALTER TABLE public.permission_audit_log 
ADD CONSTRAINT permission_audit_log_action_check 
CHECK (action = ANY (ARRAY['granted'::text, 'revoked'::text, 'updated'::text]));

-- Manually set parent_account_id for the Staff user who can't see data
UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d',
    updated_at = now()
WHERE user_id = '4ade6053-9634-44dc-b2e0-4459761945ca'
AND parent_account_id IS NULL;

-- Give the Staff user their default permissions (using correct column name)
INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
SELECT DISTINCT 
    '4ade6053-9634-44dc-b2e0-4459761945ca',
    perm.permission_name,
    'ec930f73-ef23-4430-921f-1b401859825d'
FROM (
    SELECT unnest(public.get_default_permissions_for_role('Staff')) as permission_name
) perm
WHERE perm.permission_name IS NOT NULL
ON CONFLICT (user_id, permission_name) DO NOTHING;