-- Emergency fix: Insert missing Owner permissions for Fabrich user (fabrichseo@gmail.com)
-- User ID: e5791a9f-4e0d-4c83-90bc-cdf3b5d70a49

INSERT INTO public.user_permissions (user_id, permission_name)
SELECT 'e5791a9f-4e0d-4c83-90bc-cdf3b5d70a49'::uuid, permission_name
FROM (VALUES 
  ('create_appointments'), ('create_clients'), ('create_jobs'), ('create_projects'),
  ('delete_appointments'), ('delete_clients'), ('delete_jobs'), ('delete_projects'), ('delete_users'),
  ('edit_all_clients'), ('edit_all_jobs'), ('edit_all_projects'), ('edit_assigned_clients'), ('edit_assigned_jobs'),
  ('edit_clients'), ('edit_jobs'), ('edit_projects'),
  ('export_clients'), ('export_data'), ('export_inventory'), ('export_jobs'),
  ('import_clients'), ('import_inventory'), ('import_jobs'),
  ('manage_business_settings'), ('manage_calendar'), ('manage_integrations'), ('manage_inventory'),
  ('manage_inventory_admin'), ('manage_pricing'), ('manage_purchasing'), ('manage_quotes'), ('manage_settings'),
  ('manage_shopify'), ('manage_team'), ('manage_templates'), ('manage_users'),
  ('manage_vendors'), ('manage_window_treatments'),
  ('send_emails'), ('send_team_messages'),
  ('view_all_calendar'), ('view_all_clients'), ('view_all_jobs'), ('view_all_projects'), ('view_analytics'),
  ('view_assigned_clients'), ('view_assigned_jobs'), ('view_billing'), ('view_calendar'), ('view_clients'),
  ('view_cost_prices'), ('view_documents'), ('view_email_kpis'), ('view_emails'),
  ('view_inventory'), ('view_jobs'), ('view_materials'), ('view_own_calendar'), ('view_own_jobs'),
  ('view_primary_kpis'), ('view_profile'), ('view_profit_margins'), ('view_projects'),
  ('view_purchasing'), ('view_quotes'), ('view_revenue_kpis'), ('view_selling_prices'),
  ('view_settings'), ('view_shopify'), ('view_team'), ('view_team_members'),
  ('view_team_performance'), ('view_templates'), ('view_vendors'),
  ('view_window_treatments'), ('view_workroom')
) AS p(permission_name)
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Also fix InterioApp Free Trial user who has 0 permissions
-- User ID: bddabdfa-685b-493e-b1ed-0462f739bdb2

INSERT INTO public.user_permissions (user_id, permission_name)
SELECT 'bddabdfa-685b-493e-b1ed-0462f739bdb2'::uuid, permission_name
FROM (VALUES 
  ('create_appointments'), ('create_clients'), ('create_jobs'), ('create_projects'),
  ('delete_appointments'), ('delete_clients'), ('delete_jobs'), ('delete_projects'), ('delete_users'),
  ('edit_all_clients'), ('edit_all_jobs'), ('edit_all_projects'), ('edit_assigned_clients'), ('edit_assigned_jobs'),
  ('edit_clients'), ('edit_jobs'), ('edit_projects'),
  ('export_clients'), ('export_data'), ('export_inventory'), ('export_jobs'),
  ('import_clients'), ('import_inventory'), ('import_jobs'),
  ('manage_business_settings'), ('manage_calendar'), ('manage_integrations'), ('manage_inventory'),
  ('manage_inventory_admin'), ('manage_pricing'), ('manage_purchasing'), ('manage_quotes'), ('manage_settings'),
  ('manage_shopify'), ('manage_team'), ('manage_templates'), ('manage_users'),
  ('manage_vendors'), ('manage_window_treatments'),
  ('send_emails'), ('send_team_messages'),
  ('view_all_calendar'), ('view_all_clients'), ('view_all_jobs'), ('view_all_projects'), ('view_analytics'),
  ('view_assigned_clients'), ('view_assigned_jobs'), ('view_billing'), ('view_calendar'), ('view_clients'),
  ('view_cost_prices'), ('view_documents'), ('view_email_kpis'), ('view_emails'),
  ('view_inventory'), ('view_jobs'), ('view_materials'), ('view_own_calendar'), ('view_own_jobs'),
  ('view_primary_kpis'), ('view_profile'), ('view_profit_margins'), ('view_projects'),
  ('view_purchasing'), ('view_quotes'), ('view_revenue_kpis'), ('view_selling_prices'),
  ('view_settings'), ('view_shopify'), ('view_team'), ('view_team_members'),
  ('view_team_performance'), ('view_templates'), ('view_vendors'),
  ('view_window_treatments'), ('view_workroom')
) AS p(permission_name)
ON CONFLICT (user_id, permission_name) DO NOTHING;