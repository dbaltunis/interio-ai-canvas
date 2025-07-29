-- Create appointment notifications table for scheduled notifications
CREATE TABLE public.appointment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(channels, 1) > 0), -- email, sms, push
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment notifications
CREATE POLICY "Users can view their own appointment notifications" 
ON public.appointment_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointment notifications for their appointments" 
ON public.appointment_notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE id = appointment_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own appointment notifications" 
ON public.appointment_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointment notifications" 
ON public.appointment_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_appointment_notifications_updated_at
BEFORE UPDATE ON public.appointment_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_appointment_notifications_user_id ON public.appointment_notifications(user_id);
CREATE INDEX idx_appointment_notifications_appointment_id ON public.appointment_notifications(appointment_id);
CREATE INDEX idx_appointment_notifications_scheduled_for ON public.appointment_notifications(scheduled_for);
CREATE INDEX idx_appointment_notifications_status ON public.appointment_notifications(status);

-- Create function to schedule appointment notifications
CREATE OR REPLACE FUNCTION public.schedule_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if notification is enabled
  IF NEW.notification_enabled = true THEN
    INSERT INTO public.appointment_notifications (
      user_id,
      appointment_id,
      title,
      message,
      channels,
      scheduled_for
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'Appointment Reminder',
      'You have an upcoming appointment: ' || NEW.title || ' at ' || 
      to_char(NEW.start_time AT TIME ZONE 'UTC', 'MM/DD/YYYY HH12:MI AM'),
      ARRAY['email', 'push']::TEXT[], -- Default channels, SMS can be added if phone number available
      NEW.start_time - (COALESCE(NEW.notification_minutes, 15) || ' minutes')::INTERVAL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment notifications
CREATE TRIGGER trigger_schedule_appointment_notification
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.schedule_appointment_notification();