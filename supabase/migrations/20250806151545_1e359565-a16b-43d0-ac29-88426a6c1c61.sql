-- Phase 1: Add parent-child relationship to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS parent_account_id UUID REFERENCES public.user_profiles(user_id),
ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES public.user_profiles(user_id);

-- Create account_settings table for shared settings
CREATE TABLE IF NOT EXISTS public.account_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_owner_id UUID NOT NULL REFERENCES public.user_profiles(user_id),
  business_settings JSONB DEFAULT '{}',
  integration_settings JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  measurement_units JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_owner_id)
);

-- Enable RLS on account_settings
ALTER TABLE public.account_settings ENABLE ROW LEVEL SECURITY;

-- Create access_requests table for job/client edit requests
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.user_profiles(user_id),
  approver_id UUID NOT NULL REFERENCES public.user_profiles(user_id),
  record_type TEXT NOT NULL CHECK (record_type IN ('client', 'project', 'appointment', 'quote')),
  record_id UUID NOT NULL,
  request_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Enable RLS on access_requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Add created_by to existing tables for ownership tracking
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(user_id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(user_id);

-- Update existing records to set created_by to user_id (migration)
UPDATE public.clients SET created_by = user_id WHERE created_by IS NULL;
UPDATE public.projects SET created_by = user_id WHERE created_by IS NULL;

-- Create policies for account_settings
DROP POLICY IF EXISTS "Account owners can manage their settings" ON public.account_settings;
CREATE POLICY "Account owners can manage their settings"
ON public.account_settings
FOR ALL
USING (account_owner_id = auth.uid());

DROP POLICY IF EXISTS "Child users can view parent account settings" ON public.account_settings;
CREATE POLICY "Child users can view parent account settings"
ON public.account_settings
FOR SELECT
USING (
  account_owner_id IN (
    SELECT parent_account_id 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() AND parent_account_id IS NOT NULL
  ) OR account_owner_id = auth.uid()
);

-- Create policies for access_requests
DROP POLICY IF EXISTS "Users can create access requests" ON public.access_requests;
CREATE POLICY "Users can create access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can view their own requests" ON public.access_requests;
CREATE POLICY "Users can view their own requests"
ON public.access_requests
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = approver_id);

DROP POLICY IF EXISTS "Approvers can update request status" ON public.access_requests;
CREATE POLICY "Approvers can update request status"
ON public.access_requests
FOR UPDATE
USING (auth.uid() = approver_id);

-- Function to get account owner (parent) for a user
CREATE OR REPLACE FUNCTION public.get_account_owner(user_id_param UUID)
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(parent_account_id, user_id_param)
  FROM public.user_profiles 
  WHERE user_id = user_id_param;
$$;

-- Function to check if user can edit record
CREATE OR REPLACE FUNCTION public.can_edit_record(record_user_id UUID, record_created_by UUID, record_type TEXT, record_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  account_owner_id UUID;
  has_approved_access BOOLEAN := false;
BEGIN
  -- Record owner can always edit
  IF record_created_by = current_user_id THEN
    RETURN true;
  END IF;
  
  -- Account owner (parent) can edit all records in their account
  SELECT public.get_account_owner(current_user_id) INTO account_owner_id;
  IF account_owner_id = public.get_account_owner(record_user_id) AND 
     account_owner_id = current_user_id THEN
    RETURN true;
  END IF;
  
  -- Check for approved access request
  SELECT EXISTS (
    SELECT 1 FROM public.access_requests
    WHERE requester_id = current_user_id
    AND record_type = can_edit_record.record_type
    AND record_id = can_edit_record.record_id
    AND status = 'approved'
    AND expires_at > now()
  ) INTO has_approved_access;
  
  RETURN has_approved_access;
END;
$$;

-- Create triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_account_settings_updated_at') THEN
    CREATE TRIGGER update_account_settings_updated_at
    BEFORE UPDATE ON public.account_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_access_requests_updated_at') THEN
    CREATE TRIGGER update_access_requests_updated_at
    BEFORE UPDATE ON public.access_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Migrate existing owner account data with proper JSON handling
INSERT INTO public.account_settings (account_owner_id, business_settings, integration_settings, measurement_units)
SELECT 
  user_id,
  COALESCE(
    (SELECT to_jsonb(bs) FROM (
      SELECT company_name, abn, business_email, business_phone, address, city, state, zip_code, country, website, company_logo_url
      FROM public.business_settings bs2 WHERE bs2.user_id = up.user_id LIMIT 1
    ) bs), '{}'::jsonb
  ) as business_settings,
  COALESCE(
    (SELECT jsonb_object_agg(integration_type, to_jsonb(is_data)) FROM (
      SELECT integration_type, active, api_credentials, configuration, last_sync
      FROM public.integration_settings is2 WHERE is2.user_id = up.user_id
    ) is_data), '{}'::jsonb
  ) as integration_settings,
  COALESCE(
    (SELECT measurement_units::jsonb FROM public.business_settings bs3 WHERE bs3.user_id = up.user_id LIMIT 1),
    '{"length": "mm", "area": "sq_m", "fabric": "m", "currency": "AUD"}'::jsonb
  ) as measurement_units
FROM public.user_profiles up
WHERE role = 'Owner' 
AND NOT EXISTS (SELECT 1 FROM public.account_settings WHERE account_owner_id = up.user_id);

-- Set parent_account_id for invited users
UPDATE public.user_profiles 
SET parent_account_id = (
  SELECT ui.user_id 
  FROM public.user_invitations ui 
  WHERE ui.invited_email = (
    SELECT email FROM auth.users WHERE id = user_profiles.user_id
  )
  AND ui.status = 'accepted'
  LIMIT 1
)
WHERE role != 'Owner' AND parent_account_id IS NULL;