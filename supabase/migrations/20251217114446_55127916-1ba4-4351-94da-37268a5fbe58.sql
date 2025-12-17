-- Add manage_inventory_admin permission to the permissions table
INSERT INTO public.permissions (name, description, category)
VALUES ('manage_inventory_admin', 'Access to inventory administration panel and financial data', 'financial')
ON CONFLICT (name) DO NOTHING;