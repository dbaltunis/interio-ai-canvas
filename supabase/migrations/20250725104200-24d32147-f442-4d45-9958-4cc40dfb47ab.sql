-- Enable real-time updates for appointment tables
ALTER TABLE appointments_booked REPLICA IDENTITY FULL;
ALTER TABLE appointment_schedulers REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER publication supabase_realtime ADD TABLE appointments_booked;
ALTER publication supabase_realtime ADD TABLE appointment_schedulers;

-- Create function for booking confirmation emails
CREATE OR REPLACE FUNCTION send_booking_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send for new confirmed bookings
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    -- Call the edge function to send confirmation email
    PERFORM
      net.http_post(
        url := 'https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/send-booking-confirmation',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'authorization'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking confirmation emails
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW 
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION send_booking_confirmation();