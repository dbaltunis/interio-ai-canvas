-- Fix the check constraint to allow 'updated' action
ALTER TABLE public.permission_audit_log 
DROP CONSTRAINT IF EXISTS permission_audit_log_action_check;

ALTER TABLE public.permission_audit_log 
ADD CONSTRAINT permission_audit_log_action_check 
CHECK (action = ANY (ARRAY['granted'::text, 'revoked'::text, 'updated'::text]));

-- Manually set parent_account_id for the Staff user who can't see data
UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid,
    updated_at = now()
WHERE user_id = '4ade6053-9634-44dc-b2e0-4459761945ca'::uuid
AND parent_account_id IS NULL;

-- Give the Staff user their default permissions directly without triggers
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