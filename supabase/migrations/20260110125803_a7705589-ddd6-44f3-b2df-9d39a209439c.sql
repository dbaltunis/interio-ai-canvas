-- Update subscription period to Annual
UPDATE public.user_subscriptions 
SET 
  current_period_start = '2026-01-01'::timestamp with time zone,
  current_period_end = '2026-12-31'::timestamp with time zone,
  admin_notes = 'Custom All-In Annual plan. Setup: £1,400 (2x £700). Annual: £3,100/year. First year 50% paid upfront.'
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- Add second 50% payment invoice (paid)
INSERT INTO public.custom_invoices (
  user_id,
  description,
  amount,
  currency,
  status,
  invoice_date,
  due_date,
  paid_at,
  stripe_invoice_id,
  hosted_url,
  pdf_url,
  payment_type,
  notes
) VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Annual Software Interioapp 50% payment (2nd instalment)',
  1550.00,
  'GBP',
  'paid',
  '2026-01-05',
  '2026-01-05',
  '2026-01-05',
  'in_CC113_2',
  NULL,
  NULL,
  'subscription',
  'VAT Invoice No. CC-113-2. Second 50% payment for annual software access.'
);