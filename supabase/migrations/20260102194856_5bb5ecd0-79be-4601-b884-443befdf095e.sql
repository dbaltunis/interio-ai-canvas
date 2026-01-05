-- Fix Enterprise plan to include WhatsApp
UPDATE subscription_plans 
SET features_included = features_included || '{"whatsapp": true}'::jsonb
WHERE name = 'Enterprise';

-- Create WhatsApp add-on if it doesn't exist
INSERT INTO subscription_add_ons (name, description, feature_key, add_on_type, price_monthly, price_yearly, is_active, display_order)
VALUES ('WhatsApp Messaging', 'Send WhatsApp messages to clients directly from the app', 'whatsapp', 'feature', 29.00, 290.00, true, 10)
ON CONFLICT DO NOTHING;