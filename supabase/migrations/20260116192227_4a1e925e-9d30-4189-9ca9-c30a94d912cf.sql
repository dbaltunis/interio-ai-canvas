-- Add accent_theme column to user_profiles for seasonal palette persistence
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS accent_theme TEXT DEFAULT 'brand';

-- Add desktop_notifications_enabled to user_notification_settings
ALTER TABLE public.user_notification_settings 
ADD COLUMN IF NOT EXISTS desktop_notifications_enabled BOOLEAN DEFAULT false;

-- Add appointment_reminders_enabled to user_notification_settings
ALTER TABLE public.user_notification_settings 
ADD COLUMN IF NOT EXISTS appointment_reminders_enabled BOOLEAN DEFAULT true;

-- Add comment explaining accent_theme values
COMMENT ON COLUMN public.user_profiles.accent_theme IS 'Color theme: brand, winter, spring, summer, autumn';