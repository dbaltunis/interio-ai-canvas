-- ============================================
-- Update subscription_plans to match actual pricing
-- ============================================

-- Starter Plan (was Professional)
UPDATE subscription_plans SET 
  name = 'Starter',
  description = 'Essential tools for solo operators',
  price_monthly = 99.00,
  price_yearly = 950.40,
  base_price_per_user = 99.00,
  included_users = 1,
  max_users = 1,
  max_projects = -1,
  max_inventory_items = 500,
  max_emails_per_month = 500,
  features = '["Full quoting system", "Work orders & invoices", "Markup & profit tracking", "Calendar & scheduling", "Mobile-friendly", "500 emails/month (Resend)", "Product library (up to 500)", "Integrations (Xero, Google, Apple, TWC, RFMS)", "Live video support"]',
  features_included = '{"quoting": true, "manual_quotes": true, "crm": true, "calendar": true, "inventory": true, "window_treatments": true, "email": true}'
WHERE id = 'bbebd0c6-88a5-4c37-8a10-ab51b5d9b94c';

-- Business Plan (was Enterprise)
UPDATE subscription_plans SET
  name = 'Business',
  description = 'Built to scale your team',
  price_monthly = 199.00,
  price_yearly = 1910.40,
  base_price_per_user = 99.00,
  included_users = 1,
  max_users = -1,
  max_projects = -1,
  max_inventory_items = -1,
  max_emails_per_month = -1,
  features = '["Everything in Starter", "Add branches (+£49/branch)", "Shopify integration included", "1 year FREE Shopify app", "Unlimited products", "Unlimited emails (Resend)", "Revenue analytics dashboard", "Team performance tracking", "Customer portal"]',
  features_included = '{"quoting": true, "manual_quotes": true, "crm": true, "calendar": true, "inventory": true, "window_treatments": true, "email": true, "shopify": true}'
WHERE id = '6935d9b3-3364-4f82-9f2f-64c4a1cfc5b7';

-- Enterprise Plan (was Free - convert to Contact Us)
UPDATE subscription_plans SET
  name = 'Enterprise',
  description = 'For multi-location businesses',
  price_monthly = 0,
  price_yearly = 0,
  base_price_per_user = NULL,
  included_users = -1,
  max_users = -1,
  max_projects = -1,
  max_inventory_items = -1,
  max_emails_per_month = -1,
  features = '["Everything in Business", "Volume user pricing", "Unlimited branches included", "Any e-commerce platform (custom API)", "Dealer network management", "Dedicated account manager", "Custom feature development", "SLA guarantees"]',
  features_included = '{"quoting": true, "manual_quotes": true, "crm": true, "calendar": true, "inventory": true, "window_treatments": true, "email": true, "shopify": true, "erp_integrations": true}'
WHERE id = '0590bb11-b099-4e4c-aee0-28f85ed0be78';

-- All-In Custom Plan (NEW - Private/Unlisted)
INSERT INTO subscription_plans (
  name, description, price_monthly, price_yearly, 
  base_price_per_user, included_users, max_users,
  max_projects, max_inventory_items, max_emails_per_month,
  features, features_included, is_active
) VALUES (
  'All-In Custom',
  'Private enterprise plan with custom development',
  0, 0,
  NULL, -1, -1,
  -1, -1, -1,
  '["Full platform access", "Custom feature development", "Dedicated support", "Invoice-based billing", "All integrations included", "White-label options"]',
  '{"quoting": true, "manual_quotes": true, "crm": true, "calendar": true, "inventory": true, "window_treatments": true, "wallpapers": true, "email": true, "shopify": true, "whatsapp": true, "erp_integrations": true}',
  false
);

-- ============================================
-- Update subscription_add_ons
-- ============================================

-- Add SendGrid as optional add-on (free - client provides own keys)
INSERT INTO subscription_add_ons (
  name, description, price_monthly, price_yearly, 
  add_on_type, feature_key, display_order, is_active
) VALUES (
  'SendGrid Email', 
  'Use your own SendGrid account for email sending', 
  0.00, 0.00, 
  'integration', 'sendgrid', 
  14, true
) ON CONFLICT DO NOTHING;

-- Update WhatsApp to clarify it's optional
UPDATE subscription_add_ons 
SET description = 'WhatsApp Business messaging integration (optional)'
WHERE feature_key = 'whatsapp';

-- Add Branch capacity add-on
INSERT INTO subscription_add_ons (
  name, description, price_monthly, price_yearly, 
  add_on_type, feature_key, display_order, is_active
) VALUES (
  'Additional Branch', 
  'Add extra business locations', 
  49.00, 470.40, 
  'capacity', 'branch', 
  15, true
) ON CONFLICT DO NOTHING;

-- Add User capacity add-on  
INSERT INTO subscription_add_ons (
  name, description, price_monthly, price_yearly, 
  add_on_type, feature_key, display_order, is_active
) VALUES (
  'Additional User', 
  'Add extra team members (per user)', 
  99.00, 950.40, 
  'capacity', 'user', 
  16, true
) ON CONFLICT DO NOTHING;