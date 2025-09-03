-- Create notification templates table
CREATE TABLE public.notification_templates (
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

-- Create broadcast notifications table  
CREATE TABLE public.broadcast_notifications (
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

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  notification_limits JSONB DEFAULT '{
    "email_monthly": 50,
    "sms_monthly": 25,
    "broadcast_enabled": false,
    "custom_templates": false,
    "premium_service": false
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '14 days'),
  canceled_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create notification usage tracking table
CREATE TABLE public.notification_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  count INTEGER NOT NULL DEFAULT 1,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, period_start)
);

-- Enable RLS on all tables
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "Users can manage their own notification templates"
ON public.notification_templates
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for broadcast_notifications
CREATE POLICY "Users can manage their own broadcast notifications"
ON public.broadcast_notifications
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for notification_usage
CREATE POLICY "Users can view their own notification usage"
ON public.notification_usage
FOR ALL
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcast_notifications_updated_at
BEFORE UPDATE ON public.broadcast_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, notification_limits, sort_order) VALUES
('Basic', 'Self-managed notifications with your own SendGrid/Twilio accounts', 0, 0, 
 '["Basic notifications", "Self-managed setup", "Email & SMS support", "Standard templates"]'::jsonb,
 '{"email_monthly": -1, "sms_monthly": -1, "broadcast_enabled": false, "custom_templates": true, "premium_service": false}'::jsonb,
 1),
('Managed Service', 'Built-in notification service with usage limits', 19, 190,
 '["Built-in email service", "Built-in SMS service", "200 emails/month", "100 SMS/month", "Branded templates", "Easy setup"]'::jsonb,
 '{"email_monthly": 200, "sms_monthly": 100, "broadcast_enabled": true, "custom_templates": true, "premium_service": true}'::jsonb,
 2),
('Enterprise', 'Unlimited notifications with advanced features', 49, 490,
 '["Unlimited notifications", "Custom sender domains", "Advanced templates", "Broadcast messaging", "Analytics dashboard", "Priority support"]'::jsonb,
 '{"email_monthly": -1, "sms_monthly": -1, "broadcast_enabled": true, "custom_templates": true, "premium_service": true}'::jsonb,
 3);

-- Insert default notification templates
INSERT INTO public.notification_templates (user_id, name, type, category, subject, message, variables, is_default) 
SELECT 
  auth.uid(),
  'Appointment Reminder',
  'both',
  'appointment_reminder',
  'Reminder: Your appointment with {business_name}',
  'Hi {client_name}, this is a reminder that you have an appointment scheduled for {appointment_date} at {appointment_time}. Please contact us if you need to reschedule.',
  '["client_name", "business_name", "appointment_date", "appointment_time"]'::jsonb,
  true
WHERE auth.uid() IS NOT NULL;

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