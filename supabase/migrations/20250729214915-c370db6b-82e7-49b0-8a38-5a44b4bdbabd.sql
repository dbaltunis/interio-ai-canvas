-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment_reminder', 'appointment_created', 'appointment_updated', 'appointment_cancelled')),
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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for their appointments" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  (appointment_id IS NULL OR EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE id = appointment_id AND user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_appointment_id ON public.notifications(appointment_id);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX idx_notifications_status ON public.notifications(status);

-- Create function to schedule appointment notifications
CREATE OR REPLACE FUNCTION public.schedule_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if notification is enabled
  IF NEW.notification_enabled = true THEN
    INSERT INTO public.notifications (
      user_id,
      appointment_id,
      title,
      message,
      type,
      channels,
      scheduled_for
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'Appointment Reminder',
      'You have an upcoming appointment: ' || NEW.title || ' at ' || 
      to_char(NEW.start_time AT TIME ZONE 'UTC', 'MM/DD/YYYY HH12:MI AM'),
      'appointment_reminder',
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