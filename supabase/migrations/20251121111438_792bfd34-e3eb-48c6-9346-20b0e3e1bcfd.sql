-- Remove custom permissions for System Owner to restore full role-based access
-- This fixes the issue where custom permissions were overriding System Owner role

DELETE FROM user_permissions 
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND permission_name IN ('view_email_kpis', 'view_primary_kpis', 'view_revenue_kpis');

-- Add comment explaining the fix
COMMENT ON TABLE user_permissions IS 'Custom permissions override role-based defaults. System Owners should not have custom permissions unless intentionally restricting access.';