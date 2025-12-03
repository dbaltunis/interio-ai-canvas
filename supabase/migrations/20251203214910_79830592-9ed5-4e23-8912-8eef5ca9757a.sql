-- Add missing permissions that are referenced in get_default_permissions_for_role
INSERT INTO permissions (name, description, category) VALUES
  ('edit_jobs', 'Can edit jobs', 'Jobs'),
  ('edit_clients', 'Can edit clients', 'Clients'),
  ('view_vendors', 'Can view vendors', 'Inventory'),
  ('manage_vendors', 'Can manage vendors', 'Inventory'),
  ('view_team', 'Can view team members', 'Users'),
  ('manage_team', 'Can manage team members', 'Users'),
  ('send_emails', 'Can send emails', 'Communication'),
  ('view_quotes', 'Can view quotes', 'Quotes'),
  ('view_projects', 'Can view projects', 'Projects')
ON CONFLICT (name) DO NOTHING;