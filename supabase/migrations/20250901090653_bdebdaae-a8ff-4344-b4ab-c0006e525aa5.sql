-- CRM v2 Staging Setup with Feature Flags

-- 1. Create app_user_flags table for feature flags
CREATE TABLE public.app_user_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flag text NOT NULL,
  enabled boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, flag)
);

-- Enable RLS on app_user_flags
ALTER TABLE public.app_user_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_user_flags
CREATE POLICY "Users can manage their own flags"
ON public.app_user_flags
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Create crm_accounts_v2 table
CREATE TABLE public.crm_accounts_v2 (
  row_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_account_id uuid NULL,
  name text NOT NULL,
  status text CHECK (status IN ('lead','trial','active','churn_risk','churned')) DEFAULT 'lead',
  owner uuid NULL,
  plugin_payments_eur numeric(12,2) DEFAULT 0,
  invoice_payments_eur numeric(12,2) DEFAULT 0,
  stripe_subs_eur numeric(12,2) DEFAULT 0,
  mrr_eur numeric(12,2) GENERATED ALWAYS AS (COALESCE(plugin_payments_eur,0) + COALESCE(stripe_subs_eur,0)) STORED,
  next_action text,
  next_action_date date,
  notes text,
  updated_source text CHECK (updated_source IN ('app','sheet')) DEFAULT 'app',
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on crm_accounts_v2
ALTER TABLE public.crm_accounts_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_accounts_v2
CREATE POLICY "Account owners can view all accounts"
ON public.crm_accounts_v2
FOR SELECT
USING (
  get_account_owner(auth.uid()) IS NOT NULL OR is_admin()
);

CREATE POLICY "Account owners can insert accounts"
ON public.crm_accounts_v2
FOR INSERT
WITH CHECK (
  get_account_owner(auth.uid()) IS NOT NULL OR is_admin()
);

CREATE POLICY "Account owners can update accounts"
ON public.crm_accounts_v2
FOR UPDATE
USING (
  get_account_owner(auth.uid()) IS NOT NULL OR is_admin()
);

-- 3. Create crm_sheet_links table
CREATE TABLE public.crm_sheet_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_url text NOT NULL,
  tab_name text NOT NULL,
  column_map jsonb NOT NULL DEFAULT '{}',
  is_two_way boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on crm_sheet_links
ALTER TABLE public.crm_sheet_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_sheet_links
CREATE POLICY "Account owners can manage sheet links"
ON public.crm_sheet_links
FOR ALL
USING (
  get_account_owner(auth.uid()) IS NOT NULL OR is_admin()
);

-- 4. Create stub function for legacy mirroring
CREATE OR REPLACE FUNCTION public.mirror_crm_v2_to_legacy(legacy_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No-op stub for now - will be implemented later
  -- This function will sync CRM v2 data back to legacy tables when needed
  RETURN;
END;
$$;

-- 5. Seed demo data in crm_accounts_v2
INSERT INTO public.crm_accounts_v2 (name, status, plugin_payments_eur, invoice_payments_eur, stripe_subs_eur, next_action, next_action_date, notes) VALUES
('Acme Solutions Ltd', 'trial', 2500.00, 1200.00, 599.00, 'Follow up on trial feedback', '2024-02-15', 'Trial started last week, very engaged'),
('TechFlow Innovations', 'active', 4800.00, 2200.00, 1299.00, 'Quarterly business review', '2024-02-20', 'Long-term client, stable revenue'),
('CloudVision Corp', 'churn_risk', 1800.00, 800.00, 399.00, 'Address support concerns', '2024-02-10', 'Complaints about response times'),
('DataSync Systems', 'lead', 0.00, 0.00, 0.00, 'Send proposal', '2024-02-12', 'Interested in enterprise package'),
('MobileFirst Agency', 'active', 3200.00, 1500.00, 899.00, 'Upsell discussion', '2024-02-25', 'Ready for additional features'),
('StartupBoost Inc', 'trial', 1200.00, 600.00, 299.00, 'Check trial progress', '2024-02-18', 'Small but promising startup'),
('Enterprise Global', 'active', 8500.00, 4200.00, 2499.00, 'Contract renewal', '2024-03-01', 'Major enterprise client'),
('DevTools Company', 'lead', 0.00, 0.00, 0.00, 'Demo scheduling', '2024-02-14', 'Referral from existing client'),
('ScaleUp Technologies', 'churned', 0.00, 0.00, 0.00, 'Win-back campaign', '2024-02-28', 'Left due to pricing concerns'),
('FutureWork Solutions', 'active', 2800.00, 1300.00, 699.00, 'Feature feedback session', '2024-02-22', 'Heavy user of analytics features');

-- Create indexes for performance
CREATE INDEX idx_crm_accounts_v2_status ON public.crm_accounts_v2(status);
CREATE INDEX idx_crm_accounts_v2_owner ON public.crm_accounts_v2(owner);
CREATE INDEX idx_crm_accounts_v2_next_action_date ON public.crm_accounts_v2(next_action_date);
CREATE INDEX idx_app_user_flags_user_flag ON public.app_user_flags(user_id, flag);