-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_default_permissions_for_role(text);

-- Create with correct parameter name (user_role to match original)
CREATE OR REPLACE FUNCTION public.get_default_permissions_for_role(user_role text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF user_role IN ('Owner', 'System Owner') THEN
    -- Full set of 77 permissions for account owners
    RETURN ARRAY[
      -- Jobs & Projects (18)
      'view_all_jobs', 'view_assigned_jobs', 'view_own_jobs', 'view_jobs', 'view_projects', 'view_all_projects',
      'create_jobs', 'create_projects',
      'edit_all_jobs', 'edit_assigned_jobs', 'edit_jobs', 'edit_projects', 'edit_all_projects',
      'delete_jobs', 'delete_projects',
      -- Clients (10)
      'view_all_clients', 'view_assigned_clients', 'view_clients',
      'create_clients',
      'edit_all_clients', 'edit_assigned_clients', 'edit_clients',
      'delete_clients',
      'export_clients', 'import_clients',
      -- Calendar (6)
      'view_all_calendar', 'view_own_calendar', 'view_calendar',
      'create_appointments', 'delete_appointments', 'manage_calendar',
      -- Inventory & Products (14)
      'view_inventory', 'manage_inventory', 'manage_inventory_admin',
      'view_templates', 'manage_templates',
      'view_window_treatments', 'manage_window_treatments',
      'view_vendors', 'manage_vendors',
      'view_materials',
      'export_inventory', 'import_inventory',
      -- Financial & Pricing (8)
      'view_quotes', 'manage_quotes',
      'view_cost_prices', 'view_selling_prices', 'view_profit_margins',
      'manage_pricing', 'view_billing',
      -- Purchasing (2)
      'view_purchasing', 'manage_purchasing',
      -- Team & Users (7)
      'view_team', 'view_team_members', 'view_team_performance',
      'send_team_messages', 'manage_team', 'manage_users', 'delete_users',
      -- Emails (4)
      'view_emails', 'send_emails', 'view_email_kpis',
      -- Settings & Integrations (6)
      'view_settings', 'manage_settings', 'manage_business_settings', 'manage_integrations',
      'view_shopify', 'manage_shopify',
      -- Other (7)
      'view_profile', 'view_workroom', 'view_documents', 'view_analytics',
      'view_primary_kpis', 'view_revenue_kpis',
      'export_data', 'export_jobs', 'import_jobs'
    ];
  ELSIF user_role = 'Admin' THEN
    RETURN ARRAY[
      'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs', 'delete_jobs',
      'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients', 'delete_clients',
      'view_all_calendar', 'view_own_calendar', 'create_appointments',
      'view_inventory', 'manage_inventory', 'view_templates', 'manage_templates', 'view_window_treatments',
      'view_team_members', 'view_team_performance', 'send_team_messages', 'manage_team',
      'view_settings', 'manage_business_settings',
      'view_profile', 'view_shopify', 'view_emails', 'send_emails',
      'view_workroom', 'view_email_kpis',
      'view_purchasing', 'manage_purchasing'
    ];
  ELSIF user_role = 'Manager' THEN
    RETURN ARRAY[
      'view_all_jobs', 'view_assigned_jobs', 'create_jobs', 'edit_all_jobs', 'edit_assigned_jobs',
      'view_all_clients', 'view_assigned_clients', 'create_clients', 'edit_all_clients', 'edit_assigned_clients',
      'view_all_calendar', 'view_own_calendar', 'create_appointments',
      'view_inventory', 'manage_inventory', 'view_templates', 'view_window_treatments',
      'view_team_members', 'view_team_performance', 'send_team_messages',
      'view_settings',
      'view_profile', 'view_emails', 'send_emails', 'view_workroom',
      'view_email_kpis', 'view_purchasing'
    ];
  ELSIF user_role = 'Staff' THEN
    RETURN ARRAY[
      'view_assigned_jobs', 'create_jobs', 'edit_assigned_jobs',
      'view_assigned_clients', 'create_clients', 'edit_assigned_clients',
      'view_own_calendar', 'create_appointments',
      'view_inventory', 'view_templates', 'view_window_treatments',
      'view_team_members', 'send_team_messages',
      'view_settings',
      'view_profile', 'view_emails', 'send_emails', 'view_workroom'
    ];
  ELSIF user_role = 'User' THEN
    RETURN ARRAY[
      'view_assigned_jobs',
      'view_assigned_clients',
      'view_own_calendar',
      'view_settings',
      'view_profile'
    ];
  ELSIF user_role = 'Dealer' THEN
    RETURN ARRAY[
      'view_assigned_jobs', 'create_jobs', 'edit_assigned_jobs',
      'view_assigned_clients', 'create_clients', 'edit_assigned_clients',
      'view_inventory', 'view_templates', 'view_window_treatments',
      'view_selling_prices',
      'send_emails',
      'view_settings', 'view_profile'
    ];
  ELSE
    RETURN ARRAY['view_settings'];
  END IF;
END;
$$;

-- Backfill missing permissions for all Owner/System Owner accounts
DO $$
DECLARE
  owner_user RECORD;
  owner_permissions text[] := ARRAY[
    'view_all_jobs', 'view_assigned_jobs', 'view_own_jobs', 'view_jobs', 'view_projects', 'view_all_projects',
    'create_jobs', 'create_projects',
    'edit_all_jobs', 'edit_assigned_jobs', 'edit_jobs', 'edit_projects', 'edit_all_projects',
    'delete_jobs', 'delete_projects',
    'view_all_clients', 'view_assigned_clients', 'view_clients',
    'create_clients',
    'edit_all_clients', 'edit_assigned_clients', 'edit_clients',
    'delete_clients',
    'export_clients', 'import_clients',
    'view_all_calendar', 'view_own_calendar', 'view_calendar',
    'create_appointments', 'delete_appointments', 'manage_calendar',
    'view_inventory', 'manage_inventory', 'manage_inventory_admin',
    'view_templates', 'manage_templates',
    'view_window_treatments', 'manage_window_treatments',
    'view_vendors', 'manage_vendors',
    'view_materials',
    'export_inventory', 'import_inventory',
    'view_quotes', 'manage_quotes',
    'view_cost_prices', 'view_selling_prices', 'view_profit_margins',
    'manage_pricing', 'view_billing',
    'view_purchasing', 'manage_purchasing',
    'view_team', 'view_team_members', 'view_team_performance',
    'send_team_messages', 'manage_team', 'manage_users', 'delete_users',
    'view_emails', 'send_emails', 'view_email_kpis',
    'view_settings', 'manage_settings', 'manage_business_settings', 'manage_integrations',
    'view_shopify', 'manage_shopify',
    'view_profile', 'view_workroom', 'view_documents', 'view_analytics',
    'view_primary_kpis', 'view_revenue_kpis',
    'export_data', 'export_jobs', 'import_jobs'
  ];
  perm text;
BEGIN
  FOR owner_user IN 
    SELECT user_id FROM user_profiles WHERE role IN ('Owner', 'System Owner')
  LOOP
    FOREACH perm IN ARRAY owner_permissions
    LOOP
      INSERT INTO user_permissions (user_id, permission_name)
      VALUES (owner_user.user_id, perm)
      ON CONFLICT (user_id, permission_name) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;