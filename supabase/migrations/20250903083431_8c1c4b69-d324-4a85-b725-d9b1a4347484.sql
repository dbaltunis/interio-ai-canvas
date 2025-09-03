-- Create notification templates table (only if not exists)
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  category TEXT NOT NULL CHECK (category IN ('appointment_reminder', 'follow_up', 'project_update', 'custom')),
  subject TEXT, -- For email templates
  message TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables like {client_name}, {appointment_time}
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create broadcast notifications table (only if not exists)
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all_clients', 'team_members', 'selected_users')),
  recipient_ids UUID[] DEFAULT '{}'::UUID[], -- For selected users
  template_id UUID REFERENCES public.notification_templates(id),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  recipients_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification usage tracking table (only if not exists)
CREATE TABLE IF NOT EXISTS public.notification_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  count INTEGER NOT NULL DEFAULT 1,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, period_start)
);

-- Enable RLS on new tables (if not already enabled)
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_templates' AND policyname = 'Users can manage their own notification templates') THEN
    CREATE POLICY "Users can manage their own notification templates"
    ON public.notification_templates
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for broadcast_notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'broadcast_notifications' AND policyname = 'Users can manage their own broadcast notifications') THEN
    CREATE POLICY "Users can manage their own broadcast notifications"
    ON public.broadcast_notifications
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for notification_usage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_usage' AND policyname = 'Users can view their own notification usage') THEN
    CREATE POLICY "Users can view their own notification usage"
    ON public.notification_usage
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create triggers for updated_at timestamps
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_templates_updated_at') THEN
    CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON public.notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_broadcast_notifications_updated_at') THEN
    CREATE TRIGGER update_broadcast_notifications_updated_at
    BEFORE UPDATE ON public.broadcast_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Update existing subscription_plans with notification limits if not already present
UPDATE public.subscription_plans 
SET notification_limits = CASE 
  WHEN name = 'Basic' THEN 
    '{"email_monthly": -1, "sms_monthly": -1, "broadcast_enabled": false, "custom_templates": true, "premium_service": false}'::jsonb
  WHEN name = 'Managed Service' THEN
    '{"email_monthly": 200, "sms_monthly": 100, "broadcast_enabled": true, "custom_templates": true, "premium_service": true}'::jsonb  
  WHEN name = 'Enterprise' THEN
    '{"email_monthly": -1, "sms_monthly": -1, "broadcast_enabled": true, "custom_templates": true, "premium_service": true}'::jsonb
  ELSE notification_limits
END
WHERE notification_limits IS NULL OR notification_limits = '{}';

-- Insert default notification templates for all existing users
INSERT INTO public.notification_templates (user_id, name, type, category, subject, message, variables, is_default)
SELECT 
  up.user_id,
  'Appointment Reminder',
  'both',
  'appointment_reminder',
  'Reminder: Your appointment with {business_name}',
  'Hi {client_name}, this is a reminder that you have an appointment scheduled for {appointment_date} at {appointment_time}. Please contact us if you need to reschedule.',
  '["client_name", "business_name", "appointment_date", "appointment_time"]'::jsonb,
  true
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM notification_templates nt 
  WHERE nt.user_id = up.user_id AND nt.category = 'appointment_reminder' AND nt.is_default = true
);

-- Function to check notification limits
CREATE OR REPLACE FUNCTION public.check_notification_limits(user_id_param UUID, notification_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan RECORD;
  current_usage INTEGER;
  monthly_limit INTEGER;
BEGIN
  -- Get user's current plan
  SELECT sp.notification_limits INTO user_plan
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_id_param
  AND us.status IN ('trial', 'active')
  LIMIT 1;
  
  -- If no subscription found, allow basic usage
  IF user_plan IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get monthly limit for notification type
  monthly_limit := (user_plan.notification_limits->>CASE 
    WHEN notification_type = 'email' THEN 'email_monthly'
    WHEN notification_type = 'sms' THEN 'sms_monthly'
    ELSE 'email_monthly'
  END)::INTEGER;
  
  -- -1 means unlimited
  IF monthly_limit = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current month usage
  SELECT COALESCE(SUM(count), 0) INTO current_usage
  FROM notification_usage
  WHERE user_id = user_id_param
  AND type = notification_type
  AND period_start >= DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND period_end <= (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::DATE;
  
  RETURN current_usage < monthly_limit;
END;
$$;