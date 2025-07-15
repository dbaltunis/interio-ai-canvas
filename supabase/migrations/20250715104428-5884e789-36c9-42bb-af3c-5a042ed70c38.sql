
-- Fix the RLS policy for appointments_booked to allow public booking creation
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.appointments_booked;

CREATE POLICY "Public can create bookings" 
  ON public.appointments_booked 
  FOR INSERT 
  WITH CHECK (true);

-- Add timezone information to appointments_booked
ALTER TABLE public.appointments_booked 
ADD COLUMN IF NOT EXISTS customer_timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS appointment_timezone TEXT DEFAULT 'UTC';

-- Create email templates table for custom messaging
CREATE TABLE IF NOT EXISTS public.email_templates_scheduler (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  scheduler_id UUID REFERENCES public.appointment_schedulers(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('booking_confirmation', 'reminder_24h', 'reminder_10min')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for email templates
ALTER TABLE public.email_templates_scheduler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email templates" 
  ON public.email_templates_scheduler 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create calendar integration settings table
CREATE TABLE IF NOT EXISTS public.calendar_integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  scheduler_id UUID REFERENCES public.appointment_schedulers(id) ON DELETE CASCADE,
  google_calendar_id TEXT,
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  visibility_setting TEXT NOT NULL DEFAULT 'private' CHECK (visibility_setting IN ('private', 'public', 'busy')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for calendar settings
ALTER TABLE public.calendar_integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar settings" 
  ON public.calendar_integration_settings 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add message field to appointments_booked
ALTER TABLE public.appointments_booked 
ADD COLUMN IF NOT EXISTS booking_message TEXT;

-- Create email reminders tracking table
CREATE TABLE IF NOT EXISTS public.email_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.appointments_booked(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '10min')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for email reminders
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders for their bookings" 
  ON public.email_reminders 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.appointments_booked ab
    JOIN public.appointment_schedulers s ON ab.scheduler_id = s.id
    WHERE ab.id = email_reminders.booking_id 
    AND s.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_reminders_booking_id ON public.email_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_scheduled_for ON public.email_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_templates_scheduler_id ON public.email_templates_scheduler(scheduler_id);
