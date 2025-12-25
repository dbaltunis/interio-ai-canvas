-- Add missing permissions that are referenced in the frontend but don't exist in the database
-- This fixes the foreign key constraint error when trying to assign permissions

INSERT INTO public.permissions (name, description, category)
VALUES 
    -- Jobs & Quotes
    ('view_assigned_jobs', 'Can view jobs assigned to them', 'jobs'),
    ('edit_assigned_jobs', 'Can edit jobs assigned to them', 'jobs'),
    
    -- Clients
    ('view_assigned_clients', 'Can view clients assigned to them', 'clients'),
    ('edit_assigned_clients', 'Can edit clients assigned to them', 'clients'),
    
    -- Calendar
    ('view_all_calendar', 'Can view all team calendar appointments', 'calendar'),
    ('view_own_calendar', 'Can view own calendar appointments', 'calendar'),
    
    -- Inventory & Products
    ('view_templates', 'Can view treatment templates and pricing', 'inventory'),
    ('manage_templates', 'Can create and modify treatment templates', 'inventory'),
    
    -- Financial & Pricing
    ('view_selling_prices', 'Can view customer-facing prices in quotes', 'financial'),
    ('view_cost_prices', 'Can view supplier costs and purchase prices', 'financial'),
    ('view_profit_margins', 'Can view markup percentages and profit calculations', 'financial'),
    ('manage_pricing', 'Can change prices, markups, and discounts', 'financial'),
    
    -- Team
    ('view_team_members', 'Can view list of team members', 'team'),
    ('view_team_performance', 'Can view sales metrics and KPIs for all team members', 'team'),
    ('send_team_messages', 'Can communicate with other team members', 'team'),
    ('manage_team', 'Can invite users, change roles, and set permissions', 'team'),
    
    -- Settings
    ('view_settings', 'Can access settings pages (read-only)', 'settings'),
    ('manage_business_settings', 'Can change company info, tax rates, units', 'settings'),
    ('manage_integrations', 'Can connect email, Shopify, and other services', 'settings'),
    ('view_profile', 'Can access own user profile', 'settings'),
    ('view_shopify', 'Can access Shopify integration', 'settings'),
    ('manage_shopify', 'Can configure Shopify settings', 'settings'),
    
    -- Additional
    ('view_emails', 'Can access email history and templates', 'team'),
    ('send_emails', 'Can send emails to clients', 'team'),
    ('view_workroom', 'Can access workroom and manufacturing details', 'jobs'),
    ('view_primary_kpis', 'Can see main dashboard metrics', 'financial'),
    ('view_email_kpis', 'Can see email performance metrics', 'team'),
    ('view_revenue_kpis', 'Can see revenue and sales metrics', 'financial'),
    ('view_purchasing', 'Can access purchase orders', 'inventory'),
    ('manage_purchasing', 'Can create and manage purchase orders', 'inventory'),
    ('manage_users', 'Can invite and manage team members', 'team'),
    ('view_projects', 'Can access project details', 'jobs'),
    ('create_projects', 'Can create new projects', 'jobs'),
    ('edit_projects', 'Can modify project details', 'jobs'),
    ('delete_projects', 'Can remove projects (cannot be undone)', 'jobs')
ON CONFLICT (name) DO NOTHING;

