-- Create user_profiles for the account
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  first_name,
  role,
  account_type,
  parent_account_id,
  is_active
) VALUES (
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  'Gustin',
  'Gustin',
  'Owner',
  'production',
  NULL,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'Owner',
  parent_account_id = NULL,
  is_active = true;

-- Create business_settings
INSERT INTO public.business_settings (
  user_id,
  company_name,
  measurement_units,
  tax_rate,
  tax_type
) VALUES (
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  'Gustin',
  'mm',
  15,
  'gst'
) ON CONFLICT (user_id) DO NOTHING;

-- Create account_settings
INSERT INTO public.account_settings (
  account_owner_id,
  currency,
  language,
  measurement_units
) VALUES (
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  'NZD',
  'en',
  '{"distance": "mm", "fabric": "m", "display": "metric", "currency": "NZD"}'::jsonb
) ON CONFLICT (account_owner_id) DO NOTHING;

-- Create user_permissions for Owner role (using ONLY valid permissions from permissions table)
INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
SELECT '32a92783-f482-4e3d-8ebf-c292200674e5', permission, '32a92783-f482-4e3d-8ebf-c292200674e5'
FROM unnest(ARRAY[
  'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs',
  'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
  'view_all_clients', 'edit_all_clients',
  'view_all_jobs', 'edit_all_jobs',
  'view_inventory', 'manage_inventory',
  'view_vendors', 'manage_vendors',
  'view_quotes', 'manage_quotes',
  'view_calendar', 'manage_calendar', 'view_all_calendar', 'view_own_calendar',
  'view_team', 'manage_team', 'view_team_members', 'view_team_performance',
  'view_emails', 'send_emails',
  'view_settings', 'manage_settings', 'manage_business_settings',
  'view_analytics', 'view_profile',
  'view_own_jobs', 'view_assigned_jobs', 'edit_assigned_jobs',
  'view_workroom', 'view_materials',
  'view_primary_kpis', 'view_email_kpis', 'view_revenue_kpis',
  'view_window_treatments', 'manage_window_treatments', 'manage_users',
  'view_cost_prices', 'view_selling_prices', 'view_profit_margins',
  'view_projects', 'create_projects', 'edit_projects', 'delete_projects',
  'view_templates', 'manage_templates',
  'view_purchasing', 'manage_purchasing',
  'view_billing', 'view_documents',
  'export_data', 'export_clients', 'export_jobs', 'export_inventory',
  'import_clients', 'import_jobs', 'import_inventory',
  'manage_integrations', 'manage_pricing',
  'view_shopify', 'manage_shopify',
  'create_appointments', 'delete_appointments'
]) AS permission
ON CONFLICT (user_id, permission_name) DO NOTHING;