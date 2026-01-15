-- Add 'invoice' to the subscription_type check constraint
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_subscription_type_check;

ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_subscription_type_check 
CHECK (subscription_type IN ('standard', 'partner', 'reseller', 'test', 'lifetime', 'invoice'));

-- Add invoice_number column to custom_invoices
ALTER TABLE custom_invoices 
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create subscription for Christos account (baltunis+christos@curtainscalculator.com)
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  subscription_type,
  current_period_start,
  current_period_end,
  admin_notes
) VALUES (
  '69776d93-17bb-4a8d-9657-5574a412b447',
  'd1b3e66f-4e86-4302-ba71-538d843a2742',
  'active',
  'invoice',
  '2025-04-10',
  '2026-04-10',
  'Annual invoice billing - £1,410/year. Invoice CC-108 paid.'
);

-- Create the paid invoice record
INSERT INTO custom_invoices (
  user_id,
  description,
  invoice_number,
  amount,
  currency,
  status,
  invoice_date,
  payment_type,
  paid_at,
  notes
) VALUES (
  '69776d93-17bb-4a8d-9657-5574a412b447',
  'Annual Software Subscription 2025-2026',
  'CC-108',
  1410.00,
  'GBP',
  'paid',
  CURRENT_DATE,
  'subscription',
  NOW(),
  'Annual invoice-based subscription payment'
);

-- Enable unlimited seats feature flag for the account
INSERT INTO account_feature_flags (user_id, feature_key, enabled, config)
VALUES (
  '69776d93-17bb-4a8d-9657-5574a412b447',
  'unlimited_seats',
  true,
  '{"reason": "Invoice-based annual subscription"}'
) ON CONFLICT (user_id, feature_key) DO UPDATE SET enabled = true, config = '{"reason": "Invoice-based annual subscription"}';