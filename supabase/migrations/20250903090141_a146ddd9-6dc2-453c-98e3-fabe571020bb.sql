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