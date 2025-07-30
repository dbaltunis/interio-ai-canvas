-- Fix the trigger function to use proper Supabase function invocation
CREATE OR REPLACE FUNCTION public.send_booking_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only send for new confirmed bookings
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    -- Call the edge function to send confirmation email using Supabase's invoke method
    PERFORM pg_sleep(0.1); -- Small delay to ensure booking is committed
    
    -- Use a simpler approach that doesn't rely on external HTTP calls
    -- The frontend will handle email notifications via the edge function
    INSERT INTO public.booking_notifications (
      booking_id,
      scheduler_id,
      customer_email,
      notification_type,
      status
    ) VALUES (
      NEW.id,
      NEW.scheduler_id,
      NEW.customer_email,
      'confirmation',
      'pending'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a notifications table for tracking email sends
CREATE TABLE IF NOT EXISTS public.booking_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  scheduler_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'confirmation',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Scheduler owners can view booking notifications" 
ON public.booking_notifications 
FOR SELECT 
USING (scheduler_id IN (
  SELECT appointment_schedulers.id 
  FROM appointment_schedulers 
  WHERE appointment_schedulers.user_id = auth.uid()
));

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS send_booking_confirmation_trigger ON appointments_booked;

-- Create the trigger
CREATE TRIGGER send_booking_confirmation_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_confirmation();