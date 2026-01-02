-- Activate WhatsApp add-on for all users who have an active subscription
-- First, ensure the WhatsApp add-on exists and get its ID
DO $$
DECLARE
    whatsapp_addon_id UUID;
BEGIN
    -- Get the WhatsApp add-on ID
    SELECT id INTO whatsapp_addon_id 
    FROM subscription_add_ons 
    WHERE feature_key = 'whatsapp' 
    LIMIT 1;

    -- If no WhatsApp add-on exists, create it
    IF whatsapp_addon_id IS NULL THEN
        INSERT INTO subscription_add_ons (name, description, feature_key, add_on_type, price_monthly, price_yearly, is_active, display_order)
        VALUES ('WhatsApp Messaging', 'Send WhatsApp messages to clients directly from the app', 'whatsapp', 'feature', 29.00, 290.00, true, 10)
        RETURNING id INTO whatsapp_addon_id;
    END IF;

    -- Activate WhatsApp for all users with active subscriptions (for testing)
    INSERT INTO user_subscription_add_ons (user_id, add_on_id, is_active, activated_at)
    SELECT DISTINCT us.user_id, whatsapp_addon_id, true, now()
    FROM user_subscriptions us
    WHERE us.status = 'active'
    ON CONFLICT (user_id, add_on_id) DO UPDATE SET is_active = true, activated_at = now();
END $$;