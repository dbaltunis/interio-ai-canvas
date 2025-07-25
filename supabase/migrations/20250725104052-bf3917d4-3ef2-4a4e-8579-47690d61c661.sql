-- Enable real-time updates for appointment tables
ALTER TABLE appointments_booked REPLICA IDENTITY FULL;
ALTER TABLE appointment_schedulers REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER publication supabase_realtime ADD TABLE appointments_booked;
ALTER publication supabase_realtime ADD TABLE appointment_schedulers;

-- Create trigger for booking confirmation emails
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW 
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION send_booking_confirmation();