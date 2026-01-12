-- Backfill critical missing view permissions for System Owner account ec930f73-ef23-4430-921f-1b401859825d
-- This account has only 5 permissions instead of the expected full Owner permissions

INSERT INTO user_permissions (user_id, permission_name)
SELECT 'ec930f73-ef23-4430-921f-1b401859825d', permission_name
FROM (VALUES 
  ('view_all_jobs'),
  ('view_jobs'),
  ('view_assigned_jobs'),
  ('view_own_jobs'),
  ('view_all_clients'),
  ('view_clients'),
  ('view_assigned_clients'),
  ('view_calendar'),
  ('view_all_calendar'),
  ('view_own_calendar'),
  ('view_inventory'),
  ('view_emails'),
  ('view_email_kpis'),
  ('view_settings'),
  ('view_billing'),
  ('view_analytics'),
  ('view_primary_kpis'),
  ('view_revenue_kpis'),
  ('view_projects'),
  ('view_all_projects'),
  ('view_quotes'),
  ('view_team'),
  ('view_team_members'),
  ('view_documents'),
  ('view_workroom'),
  ('create_jobs'),
  ('create_clients'),
  ('create_projects'),
  ('create_appointments'),
  ('manage_inventory'),
  ('manage_calendar'),
  ('manage_team'),
  ('manage_templates'),
  ('manage_settings'),
  ('manage_integrations'),
  ('manage_users'),
  ('manage_quotes'),
  ('manage_pricing'),
  ('manage_business_settings')
) AS missing_perms(permission_name)
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions 
  WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d' 
  AND user_permissions.permission_name = missing_perms.permission_name
);