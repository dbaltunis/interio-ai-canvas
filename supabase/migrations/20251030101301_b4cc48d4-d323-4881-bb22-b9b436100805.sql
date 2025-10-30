-- Fix send_booking_confirmation trigger to work with appointments_booked table
-- The appointments_booked table doesn't have a user_id field

-- Drop duplicate triggers first
DROP TRIGGER IF EXISTS send_booking_confirmation_trigger ON appointments_booked;
DROP TRIGGER IF EXISTS booking_confirmation_trigger ON appointments_booked;

-- Recreate the function to properly handle the appointments_booked table
CREATE OR REPLACE FUNCTION send_booking_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Only send for new confirmed bookings
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    -- Call the edge function to send confirmation email
    -- Note: This uses pg_net extension which should handle the async call
    PERFORM
      net.http_post(
        url := current_setting('app.settings.api_external_url', true) || '/functions/v1/send-booking-confirmation',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'booking_id', NEW.id,
          'customer_name', NEW.customer_name,
          'customer_email', NEW.customer_email,
          'appointment_date', NEW.appointment_date,
          'appointment_time', NEW.appointment_time,
          'scheduler_id', NEW.scheduler_id
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a single trigger
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_confirmation();