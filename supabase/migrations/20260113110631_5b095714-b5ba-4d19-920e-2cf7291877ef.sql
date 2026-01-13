-- Backfill missing System Owner permissions for account ec930f73-ef23-4430-921f-1b401859825d
-- Adding the 13 missing permissions identified from ROLE_PERMISSIONS constant

INSERT INTO user_permissions (user_id, permission_name)
SELECT 'ec930f73-ef23-4430-921f-1b401859825d', permission_name
FROM (VALUES 
  ('delete_clients'),
  ('manage_inventory_admin'),
  ('view_templates'),
  ('manage_templates'),
  ('view_window_treatments'),
  ('view_team_performance'),
  ('send_team_messages'),
  ('view_profile'),
  ('view_shopify'),
  ('manage_shopify'),
  ('send_emails'),
  ('view_purchasing'),
  ('manage_purchasing')
) AS missing_perms(permission_name)
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions 
  WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d' 
  AND user_permissions.permission_name = missing_perms.permission_name
);