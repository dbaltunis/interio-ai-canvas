-- Fix the schedule_appointment_notification trigger to include title
CREATE OR REPLACE FUNCTION public.schedule_appointment_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification if the appointment has notification_enabled set to true
  IF NEW.notification_enabled = true THEN
    INSERT INTO notifications (user_id, title, message, created_at)
    VALUES (
      NEW.user_id, 
      'Appointment Scheduled',
      'Your appointment "' || NEW.title || '" is scheduled for ' || to_char(NEW.start_time, 'YYYY-MM-DD HH24:MI'),
      now()
    );
  END IF;
  RETURN NEW;
END;
$function$;