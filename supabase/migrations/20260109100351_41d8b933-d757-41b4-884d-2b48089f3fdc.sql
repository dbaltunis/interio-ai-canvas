-- Step 1: Add 41 missing permissions to 6 Owner accounts with only 36 permissions
INSERT INTO user_permissions (user_id, permission_name)
SELECT u.user_id, p.permission_name
FROM (
  VALUES 
    ('1bbd8c29-f892-417e-ae5c-48d2147cb6fa'::uuid),
    ('708d8e36-8fa3-4e07-b43b-c0a90941f991'::uuid),
    ('19b05a62-5e81-415b-9a5b-2d85f57943d6'::uuid),
    ('50a23348-3817-47ff-bf43-c0d3f3749a6a'::uuid),
    ('b0c727dd-b9bf-4470-840d-1f630e8f2b26'::uuid),
    ('ecff6451-e641-4baa-8f1d-d76709950025'::uuid)
) AS u(user_id)
CROSS JOIN (
  VALUES 
    ('create_appointments'), ('create_projects'),
    ('delete_appointments'), ('delete_projects'), ('delete_users'),
    ('edit_all_clients'), ('edit_all_projects'), ('edit_assigned_clients'), ('edit_projects'),
    ('export_clients'), ('export_data'), ('export_inventory'), ('export_jobs'),
    ('import_clients'), ('import_inventory'), ('import_jobs'),
    ('manage_business_settings'), ('manage_integrations'), ('manage_inventory_admin'),
    ('manage_pricing'), ('manage_purchasing'), ('manage_shopify'), ('manage_templates'),
    ('send_team_messages'),
    ('view_all_calendar'), ('view_all_clients'), ('view_all_projects'),
    ('view_assigned_clients'), ('view_assigned_jobs'), ('view_billing'),
    ('view_cost_prices'), ('view_documents'), ('view_own_calendar'),
    ('view_profit_margins'), ('view_projects'), ('view_purchasing'),
    ('view_selling_prices'), ('view_shopify'), ('view_team_members'),
    ('view_team_performance'), ('view_templates')
) AS p(permission_name)
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Step 2: Add 7 missing permissions to Interioapp Admin
INSERT INTO user_permissions (user_id, permission_name)
VALUES 
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'delete_users'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'edit_all_projects'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'edit_assigned_clients'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'manage_inventory_admin'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'send_team_messages'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'view_all_projects'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'view_assigned_clients')
ON CONFLICT (user_id, permission_name) DO NOTHING;