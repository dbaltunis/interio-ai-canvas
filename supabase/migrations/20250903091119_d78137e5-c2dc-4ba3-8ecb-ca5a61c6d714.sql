-- Update email_settings to be account-level instead of user-level
ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS account_owner_id UUID;

-- Update existing email_settings to use account owner
UPDATE public.email_settings 
SET account_owner_id = get_account_owner(user_id)
WHERE account_owner_id IS NULL;

-- Create new RLS policies for account-level access
DROP POLICY IF EXISTS "Users can view their email settings" ON public.email_settings;
DROP POLICY IF EXISTS "Users can update their email settings" ON public.email_settings;
DROP POLICY IF EXISTS "Users can create their email settings" ON public.email_settings;

CREATE POLICY "Account members can view email settings" 
ON public.email_settings 
FOR SELECT 
USING (get_account_owner(auth.uid()) = account_owner_id);

CREATE POLICY "Account owners can update email settings" 
ON public.email_settings 
FOR UPDATE 
USING (auth.uid() = account_owner_id);

CREATE POLICY "Account owners can create email settings" 
ON public.email_settings 
FOR INSERT 
WITH CHECK (auth.uid() = get_account_owner(auth.uid()));

-- Update integration_settings to be account-level
ALTER TABLE public.integration_settings 
ADD COLUMN IF NOT EXISTS account_owner_id UUID;

-- Update existing integration_settings to use account owner
UPDATE public.integration_settings 
SET account_owner_id = get_account_owner(user_id)
WHERE account_owner_id IS NULL;

-- Create new RLS policies for integration settings
DROP POLICY IF EXISTS "Users can view their integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Users can update their integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Users can create their integration settings" ON public.integration_settings;

CREATE POLICY "Account members can view integration settings" 
ON public.integration_settings 
FOR SELECT 
USING (get_account_owner(auth.uid()) = account_owner_id);

CREATE POLICY "Account owners can update integration settings" 
ON public.integration_settings 
FOR UPDATE 
USING (auth.uid() = account_owner_id);

CREATE POLICY "Account owners can create integration settings" 
ON public.integration_settings 
FOR INSERT 
WITH CHECK (auth.uid() = get_account_owner(auth.uid()));

-- Update user_notification_settings to be account-level
ALTER TABLE public.user_notification_settings 
ADD COLUMN IF NOT EXISTS account_owner_id UUID;

-- Update existing user_notification_settings
UPDATE public.user_notification_settings 
SET account_owner_id = get_account_owner(user_id)
WHERE account_owner_id IS NULL;

-- Update RLS policies for notification settings
DROP POLICY IF EXISTS "Users can view their notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can update their notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can create their notification settings" ON public.user_notification_settings;

CREATE POLICY "Account members can view notification settings" 
ON public.user_notification_settings 
FOR SELECT 
USING (get_account_owner(auth.uid()) = account_owner_id);

CREATE POLICY "Account owners can update notification settings" 
ON public.user_notification_settings 
FOR UPDATE 
USING (auth.uid() = account_owner_id);

CREATE POLICY "Account owners can create notification settings" 
ON public.user_notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = get_account_owner(auth.uid()));