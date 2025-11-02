-- Add missing permissions for Shopify and emails
INSERT INTO public.permissions (name, description, category) VALUES 
('view_shopify', 'Can view Shopify integration and online store data', 'integrations'),
('manage_shopify', 'Can manage Shopify integration and sync products', 'integrations'),
('view_emails', 'Can view email campaigns and metrics', 'communications')
ON CONFLICT (name) DO NOTHING;