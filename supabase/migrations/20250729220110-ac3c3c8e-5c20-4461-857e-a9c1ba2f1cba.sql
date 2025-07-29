-- Create user notification settings table
CREATE TABLE public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  email_service_provider TEXT CHECK (email_service_provider IN ('resend', 'sendgrid', 'mailgun')) DEFAULT 'resend',
  email_api_key_encrypted TEXT,
  email_from_address TEXT,
  email_from_name TEXT,
  sms_service_provider TEXT CHECK (sms_service_provider IN ('twilio', 'vonage')) DEFAULT 'twilio',
  sms_api_key_encrypted TEXT,
  sms_phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification settings" 
ON public.user_notification_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification settings" 
ON public.user_notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
ON public.user_notification_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" 
ON public.user_notification_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_notification_settings_updated_at
BEFORE UPDATE ON public.user_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_user_notification_settings_user_id ON public.user_notification_settings(user_id);