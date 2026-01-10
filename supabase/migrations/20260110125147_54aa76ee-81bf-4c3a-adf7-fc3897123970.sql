-- =====================================================
-- HOMEKAARA ACCOUNT PROVISIONING (UPDATE EXISTING)
-- User: baltunis+rachel@curtainscalculator.com
-- User ID: 708d8e36-8fa3-4e07-b43b-c0a90941f991
-- =====================================================

-- 1. Update user_profile
UPDATE public.user_profiles SET
  display_name = 'Homekaara',
  account_type = 'partner'
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- 2. Update user_subscription to All-In Custom plan
UPDATE public.user_subscriptions SET
  plan_id = 'd1b3e66f-4e86-4302-ba71-538d843a2742',
  stripe_customer_id = 'cus_TEYyIWNhg3luBx',
  stripe_subscription_id = NULL,
  status = 'active',
  subscription_type = 'partner',
  current_period_start = '2026-01-05',
  current_period_end = '2026-12-31',
  admin_notes = 'Annual £3,100 - 50% paid upfront (£1,550), remaining in installments: £700 June, £700 December. Next renewal January 2027.'
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- 3. Insert Custom Invoices (skip if already exist by checking stripe_invoice_id)

-- CC-113: 50% upfront payment (PAID)
INSERT INTO public.custom_invoices (
  user_id, description, amount, currency, status, invoice_date, paid_at,
  payment_type, stripe_invoice_id, hosted_url, notes
) 
SELECT 
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Annual Software Interioapp 50% payment',
  1550.00, 'GBP', 'paid', '2026-01-05', '2026-01-05 00:00:00+00',
  'setup', 'in_1SYhRmBgcx5218GhthzKhOKk',
  'https://invoice.stripe.com/i/acct_1FpJwwBgcx5218Gh/live_YWNjdF8xRnBKd3dCZ2N4NTIxOEdoLF9UVml0ekJkQzNFczBpcGxpVU9yeEF4ZXFFUGNVeXZaLDE1ODU4ODgyNA0200OjH7pCeJ?s=ap',
  'First 50% payment for annual license - Invoice CC-113'
WHERE NOT EXISTS (
  SELECT 1 FROM public.custom_invoices 
  WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
  AND stripe_invoice_id = 'in_1SYhRmBgcx5218GhthzKhOKk'
);

-- Setup payment June 2026 (PENDING)
INSERT INTO public.custom_invoices (
  user_id, description, amount, currency, status, invoice_date, due_date, payment_type, notes
)
SELECT 
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Setup payment', 700.00, 'GBP', 'pending', '2026-06-01', '2026-06-30', 'setup',
  'Second installment for setup'
WHERE NOT EXISTS (
  SELECT 1 FROM public.custom_invoices 
  WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
  AND description = 'Setup payment' AND due_date = '2026-06-30'
);

-- Setup payment December 2026 (PENDING)
INSERT INTO public.custom_invoices (
  user_id, description, amount, currency, status, invoice_date, due_date, payment_type, notes
)
SELECT 
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Setup payment', 700.00, 'GBP', 'pending', '2026-12-01', '2026-12-31', 'setup',
  'Third installment for setup'
WHERE NOT EXISTS (
  SELECT 1 FROM public.custom_invoices 
  WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
  AND description = 'Setup payment' AND due_date = '2026-12-31'
);

-- Annual subscription renewal 2027 (PENDING)
INSERT INTO public.custom_invoices (
  user_id, description, amount, currency, status, invoice_date, due_date, payment_type, notes
)
SELECT 
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Annual subscription', 3100.00, 'GBP', 'pending', '2026-12-01', '2027-01-31', 'subscription',
  'Annual renewal for 2027'
WHERE NOT EXISTS (
  SELECT 1 FROM public.custom_invoices 
  WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991' 
  AND description = 'Annual subscription' AND due_date = '2027-01-31'
);