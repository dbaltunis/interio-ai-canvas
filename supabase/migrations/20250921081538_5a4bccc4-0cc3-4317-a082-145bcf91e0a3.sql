-- Create trigger to automatically create default notification settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default notification settings for new user
  INSERT INTO public.user_notification_settings (
    user_id,
    email_notifications_enabled,
    sms_notifications_enabled,
    email_service_provider,
    sms_service_provider,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    true,  -- Default to email notifications enabled
    false, -- Default to SMS notifications disabled
    'resend', -- Default email provider
    'twilio', -- Default SMS provider
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Avoid duplicates
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_notification_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_settings();

-- Also create default notification settings for existing users who don't have them
INSERT INTO public.user_notification_settings (
  user_id,
  email_notifications_enabled,
  sms_notifications_enabled,
  email_service_provider,
  sms_service_provider,
  created_at,
  updated_at
)
SELECT 
  up.user_id,
  COALESCE(up.email_notifications, true),
  COALESCE(up.sms_notifications, false),
  'resend',
  'twilio',
  now(),
  now()
FROM public.user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notification_settings uns 
  WHERE uns.user_id = up.user_id
)
ON CONFLICT (user_id) DO NOTHING;