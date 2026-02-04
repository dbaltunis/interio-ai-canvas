
# Setup Laela Account with Invoice Subscription

## Account Details
- **Email**: baltunis+laela@curtainscalculator.com
- **User ID**: `4eebf4ef-bc13-4e57-b120-32a0ca281932`
- **Display Name**: InterioApp
- **Current Status**: No subscription, no invoices

## Invoice Details (from PDF CC-114)
| Field | Value |
|-------|-------|
| Invoice Number | CC-114 |
| Invoice Date | 2026-01-30 |
| Amount (Net) | €2,496.00 |
| VAT (21%) | €524.00 |
| **Total** | **€3,020.00** |
| Description | Annual Application Subscription 2025-02-01 to 2026-02-01 |
| Status | Pending (Unpaid) |
| Setup Fee | None (as noted on invoice) |

---

## Database Changes Required

### Step 1: Create Active Invoice-Based Subscription

```sql
INSERT INTO public.user_subscriptions (
  user_id,
  plan_id,
  status,
  subscription_type,
  current_period_start,
  current_period_end,
  total_users,
  admin_notes
) VALUES (
  '4eebf4ef-bc13-4e57-b120-32a0ca281932',
  'd1b3e66f-4e86-4302-ba71-538d843a2742',  -- All-In Custom plan
  'active',
  'invoice',
  '2025-02-01'::timestamp,
  '2026-02-01'::timestamp,
  1,
  'Annual invoice billing (CC-114). No setup fee. Invoice pending payment.'
);
```

This creates:
- **Status**: `active` (they can use the app)
- **Subscription Type**: `invoice` (bypasses Stripe, manually managed)
- **Period**: Feb 1, 2025 - Feb 1, 2026

---

### Step 2: Create Pending Custom Invoice

```sql
INSERT INTO public.custom_invoices (
  user_id,
  description,
  invoice_number,
  amount,
  currency,
  status,
  invoice_date,
  due_date,
  payment_type,
  notes
) VALUES (
  '4eebf4ef-bc13-4e57-b120-32a0ca281932',
  'Annual Application Subscription (2025-02-01 to 2026-02-01)',
  'CC-114',
  3020.00,  -- Total including VAT
  'EUR',
  'pending',
  '2026-01-30',
  '2026-02-28',  -- Due date (30 days from invoice)
  'subscription',
  'Metinis aplikacijos abonementas. Suma be PVM: €2,496.00, PVM 21%: €524.00. Mokėjimas laukiamas.'
);
```

This creates:
- **Status**: `pending` (unpaid)
- **Amount**: €3,020.00 (including VAT)
- **Payment Type**: `subscription`
- **Due Date**: Feb 28, 2026

---

## What This Achieves

1. ✅ **Account shows as "Active"** - User can log in and use all features
2. ✅ **Invoice visible in billing** - CC-114 appears in their Custom Invoices tab
3. ✅ **Invoice marked as Pending** - Shows as unpaid until you update it
4. ✅ **No setup fee** - Only the annual subscription invoice
5. ✅ **Invoice downloadable** - Users can view/download from their billing page

---

## When Payment is Received

Run this SQL to mark as paid:

```sql
UPDATE public.custom_invoices 
SET status = 'paid', paid_at = NOW() 
WHERE invoice_number = 'CC-114' 
  AND user_id = '4eebf4ef-bc13-4e57-b120-32a0ca281932';
```

---

## Summary

| Action | Details |
|--------|---------|
| Create Subscription | `active` status, `invoice` type, All-In Custom plan |
| Create Invoice | CC-114, €3,020.00, `pending` status |
| Affected Account | baltunis+laela@curtainscalculator.com ONLY |
