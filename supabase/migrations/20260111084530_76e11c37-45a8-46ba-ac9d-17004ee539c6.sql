-- Create account_feature_flags table for premium features like dealer portal
CREATE TABLE IF NOT EXISTS public.account_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature_key text NOT NULL,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.account_feature_flags ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check account features (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_account_feature(_user_id uuid, _feature_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_feature_flags
    WHERE user_id = _user_id
      AND feature_key = _feature_key
      AND enabled = true
  )
$$;

-- Function to get feature config
CREATE OR REPLACE FUNCTION public.get_account_feature_config(_user_id uuid, _feature_key text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(config, '{}'::jsonb)
  FROM public.account_feature_flags
  WHERE user_id = _user_id
    AND feature_key = _feature_key
    AND enabled = true
$$;

-- RLS Policies for account_feature_flags
-- Account owners can view their own feature flags
CREATE POLICY "Account owners can view own feature flags"
ON public.account_feature_flags
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Child accounts can view parent's feature flags (for dealer portal access)
CREATE POLICY "Child accounts can view parent feature flags"
ON public.account_feature_flags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.parent_account_id = account_feature_flags.user_id
  )
);

-- Only account owners can manage their feature flags
CREATE POLICY "Account owners can manage feature flags"
ON public.account_feature_flags
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Enable dealer_portal feature for Homekaara account
INSERT INTO public.account_feature_flags (user_id, feature_key, enabled, config)
VALUES (
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'dealer_portal',
  true,
  '{"dealer_seat_price": 0, "unlimited_seats": true, "pricing_note": "Included in All-In Custom plan"}'::jsonb
)
ON CONFLICT (user_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config,
  updated_at = now();

-- Function to check if user is a dealer
CREATE OR REPLACE FUNCTION public.is_dealer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'Dealer'::app_role
  )
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_account_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_account_feature_flags_updated_at ON public.account_feature_flags;
CREATE TRIGGER update_account_feature_flags_updated_at
BEFORE UPDATE ON public.account_feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_account_feature_flags_updated_at();