
-- Add account_owner_id to SMS tables for account-level sharing
ALTER TABLE public.sms_campaigns ADD COLUMN IF NOT EXISTS account_owner_id UUID;
ALTER TABLE public.sms_contacts ADD COLUMN IF NOT EXISTS account_owner_id UUID;
ALTER TABLE public.sms_templates ADD COLUMN IF NOT EXISTS account_owner_id UUID;
ALTER TABLE public.sms_delivery_logs ADD COLUMN IF NOT EXISTS account_owner_id UUID;

-- Populate account_owner_id for existing records
UPDATE public.sms_campaigns 
SET account_owner_id = public.get_account_owner(user_id)
WHERE account_owner_id IS NULL;

UPDATE public.sms_contacts 
SET account_owner_id = public.get_account_owner(user_id)
WHERE account_owner_id IS NULL;

UPDATE public.sms_templates 
SET account_owner_id = public.get_account_owner(user_id)
WHERE account_owner_id IS NULL;

-- For sms_delivery_logs, get account_owner_id from related campaign or contact
UPDATE public.sms_delivery_logs sdl
SET account_owner_id = COALESCE(
  (SELECT account_owner_id FROM public.sms_campaigns WHERE id = sdl.campaign_id),
  (SELECT account_owner_id FROM public.sms_contacts WHERE id = sdl.contact_id),
  (SELECT account_owner_id FROM public.sms_templates WHERE id = sdl.template_id)
)
WHERE account_owner_id IS NULL;

-- Create trigger function to auto-populate account_owner_id for campaigns, contacts, templates
CREATE OR REPLACE FUNCTION public.set_sms_account_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.account_owner_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.account_owner_id := public.get_account_owner(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function for sms_delivery_logs (no user_id, get from related tables)
CREATE OR REPLACE FUNCTION public.set_sms_delivery_log_account_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.account_owner_id IS NULL THEN
    -- Try to get from campaign first, then contact, then template
    SELECT account_owner_id INTO NEW.account_owner_id
    FROM public.sms_campaigns
    WHERE id = NEW.campaign_id;
    
    IF NEW.account_owner_id IS NULL AND NEW.contact_id IS NOT NULL THEN
      SELECT account_owner_id INTO NEW.account_owner_id
      FROM public.sms_contacts
      WHERE id = NEW.contact_id;
    END IF;
    
    IF NEW.account_owner_id IS NULL AND NEW.template_id IS NOT NULL THEN
      SELECT account_owner_id INTO NEW.account_owner_id
      FROM public.sms_templates
      WHERE id = NEW.template_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Add triggers to auto-populate account_owner_id on insert
DROP TRIGGER IF EXISTS set_sms_campaigns_account_owner ON public.sms_campaigns;
CREATE TRIGGER set_sms_campaigns_account_owner
  BEFORE INSERT ON public.sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sms_account_owner_id();

DROP TRIGGER IF EXISTS set_sms_contacts_account_owner ON public.sms_contacts;
CREATE TRIGGER set_sms_contacts_account_owner
  BEFORE INSERT ON public.sms_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sms_account_owner_id();

DROP TRIGGER IF EXISTS set_sms_templates_account_owner ON public.sms_templates;
CREATE TRIGGER set_sms_templates_account_owner
  BEFORE INSERT ON public.sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sms_account_owner_id();

DROP TRIGGER IF EXISTS set_sms_delivery_logs_account_owner ON public.sms_delivery_logs;
CREATE TRIGGER set_sms_delivery_logs_account_owner
  BEFORE INSERT ON public.sms_delivery_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sms_delivery_log_account_owner_id();

-- Update RLS policies for account-scoped access
-- SMS Campaigns
DROP POLICY IF EXISTS "Users can create SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can view SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can update SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can delete SMS campaigns" ON public.sms_campaigns;

CREATE POLICY "Users can create SMS campaigns within their account"
  ON public.sms_campaigns FOR INSERT
  WITH CHECK (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can view SMS campaigns in their account"
  ON public.sms_campaigns FOR SELECT
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can update SMS campaigns in their account"
  ON public.sms_campaigns FOR UPDATE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can delete SMS campaigns in their account"
  ON public.sms_campaigns FOR DELETE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

-- SMS Contacts
DROP POLICY IF EXISTS "Users can create SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can view SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can update SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can delete SMS contacts" ON public.sms_contacts;

CREATE POLICY "Users can create SMS contacts within their account"
  ON public.sms_contacts FOR INSERT
  WITH CHECK (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can view SMS contacts in their account"
  ON public.sms_contacts FOR SELECT
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can update SMS contacts in their account"
  ON public.sms_contacts FOR UPDATE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can delete SMS contacts in their account"
  ON public.sms_contacts FOR DELETE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

-- SMS Templates
DROP POLICY IF EXISTS "Users can create their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can view their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can update their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can delete their own SMS templates" ON public.sms_templates;

CREATE POLICY "Users can create SMS templates within their account"
  ON public.sms_templates FOR INSERT
  WITH CHECK (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can view SMS templates in their account"
  ON public.sms_templates FOR SELECT
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can update SMS templates in their account"
  ON public.sms_templates FOR UPDATE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can delete SMS templates in their account"
  ON public.sms_templates FOR DELETE
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

-- SMS Delivery Logs
DROP POLICY IF EXISTS "Users can view SMS logs for their campaigns" ON public.sms_delivery_logs;

CREATE POLICY "Users can view SMS delivery logs in their account"
  ON public.sms_delivery_logs FOR SELECT
  USING (
    account_owner_id = public.get_account_owner(auth.uid())
  );

CREATE POLICY "Users can create SMS delivery logs within their account"
  ON public.sms_delivery_logs FOR INSERT
  WITH CHECK (
    account_owner_id = public.get_account_owner(auth.uid())
  );
