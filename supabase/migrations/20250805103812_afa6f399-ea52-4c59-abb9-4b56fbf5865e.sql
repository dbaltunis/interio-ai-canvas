-- Continue updating remaining tables for admin access

-- Email Campaigns  
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;

CREATE POLICY "Users can create campaigns" ON public.email_campaigns
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view campaigns" ON public.email_campaigns
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update campaigns" ON public.email_campaigns
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete campaigns" ON public.email_campaigns
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- SMS Campaigns
DROP POLICY IF EXISTS "Users can create their own SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can delete their own SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can update their own SMS campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Users can view their own SMS campaigns" ON public.sms_campaigns;

CREATE POLICY "Users can create SMS campaigns" ON public.sms_campaigns
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view SMS campaigns" ON public.sms_campaigns
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update SMS campaigns" ON public.sms_campaigns
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete SMS campaigns" ON public.sms_campaigns
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- SMS Contacts
DROP POLICY IF EXISTS "Users can create their own SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can delete their own SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can update their own SMS contacts" ON public.sms_contacts;
DROP POLICY IF EXISTS "Users can view their own SMS contacts" ON public.sms_contacts;

CREATE POLICY "Users can create SMS contacts" ON public.sms_contacts
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view SMS contacts" ON public.sms_contacts
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update SMS contacts" ON public.sms_contacts
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete SMS contacts" ON public.sms_contacts
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Integration Settings
DROP POLICY IF EXISTS "Users can create their own integrations" ON public.integration_settings;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.integration_settings;
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.integration_settings;

CREATE POLICY "Users can create integrations" ON public.integration_settings
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view integrations" ON public.integration_settings
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update integrations" ON public.integration_settings
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- User Invitations (keep restricted to user's own)
-- This should remain user-specific for security

-- Appointment Schedulers
DROP POLICY IF EXISTS "Users can create their own schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can delete their own schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can update their own schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can view their own schedulers" ON public.appointment_schedulers;

CREATE POLICY "Users can create schedulers" ON public.appointment_schedulers
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view schedulers" ON public.appointment_schedulers
FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR active = true);

CREATE POLICY "Users can update schedulers" ON public.appointment_schedulers
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete schedulers" ON public.appointment_schedulers
FOR DELETE USING (auth.uid() = user_id OR public.is_admin());