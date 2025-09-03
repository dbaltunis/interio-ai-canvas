-- Fix RLS policies for appointments_booked table
DROP POLICY IF EXISTS "Scheduler owners can view their bookings" ON appointments_booked;
DROP POLICY IF EXISTS "Users can view relevant bookings" ON appointments_booked;

-- Create correct RLS policies for appointments_booked
CREATE POLICY "Scheduler owners can view their bookings" 
ON appointments_booked 
FOR SELECT 
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
);

-- Create notification_usage table for tracking usage
CREATE TABLE IF NOT EXISTS public.notification_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  email_count INTEGER NOT NULL DEFAULT 0,
  sms_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS on notification_usage
ALTER TABLE public.notification_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_usage
CREATE POLICY "Users can view their own notification usage" 
ON public.notification_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification usage" 
ON public.notification_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification usage" 
ON public.notification_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user_subscriptions table for managing subscription plans
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Basic',
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default subscription for existing users
INSERT INTO public.user_subscriptions (user_id, plan_name, features, limits)
SELECT 
  id,
  'Basic',
  '{"notification_setup": true, "message_templates": true, "broadcast_messages": false}'::jsonb,
  '{"email_monthly": 50, "sms_monthly": 10}'::jsonb
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;