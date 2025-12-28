-- Add client edit permissions for the system owner user
INSERT INTO user_permissions (user_id, permission_name, granted_at)
VALUES 
  ('ec930f73-ef23-4430-921f-1b401859825d', 'edit_all_clients', now()),
  ('ec930f73-ef23-4430-921f-1b401859825d', 'edit_assigned_clients', now())
ON CONFLICT (user_id, permission_name) DO NOTHING;