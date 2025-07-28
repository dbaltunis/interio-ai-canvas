-- Create the booking confirmation trigger on appointments_booked table
DROP TRIGGER IF EXISTS booking_confirmation_trigger ON appointments_booked;
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_confirmation();

-- Create email templates table for customizable booking emails
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Users can create their own templates" 
ON email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own templates" 
ON email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insert default booking confirmation template
INSERT INTO email_templates (user_id, template_type, subject, content, variables) 
SELECT 
  auth.uid(),
  'booking_confirmation',
  'Booking Confirmation - {{appointment_date}} at {{appointment_time}}',
  '<h1>Booking Confirmed!</h1>
   <p>Hi {{customer_name}},</p>
   <p>Your appointment has been confirmed for <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong>.</p>
   <p><strong>Duration:</strong> {{duration}} minutes</p>
   <p>We look forward to meeting with you!</p>
   <p>Best regards,<br>{{company_name}}</p>',
  '["customer_name", "appointment_date", "appointment_time", "duration", "company_name"]'::jsonb
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create function to sync booked appointments to main appointments table
CREATE OR REPLACE FUNCTION sync_booking_to_appointments()
RETURNS TRIGGER AS $$
BEGIN
  -- Create appointment in main appointments table when booking is confirmed
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    INSERT INTO appointments (
      user_id,
      title,
      description,
      start_time,
      end_time,
      location,
      appointment_type,
      status
    )
    SELECT 
      s.user_id,
      'Booked: ' || NEW.customer_name,
      'Customer: ' || NEW.customer_name || 
      CASE WHEN NEW.customer_email IS NOT NULL THEN E'\nEmail: ' || NEW.customer_email ELSE '' END ||
      CASE WHEN NEW.customer_phone IS NOT NULL THEN E'\nPhone: ' || NEW.customer_phone ELSE '' END ||
      CASE WHEN NEW.notes IS NOT NULL THEN E'\nNotes: ' || NEW.notes ELSE '' END,
      (NEW.appointment_date::text || ' ' || NEW.appointment_time::text)::timestamp,
      (NEW.appointment_date::text || ' ' || NEW.appointment_time::text)::timestamp + (s.duration || ' minutes')::interval,
      NEW.location_type,
      'consultation',
      'confirmed'
    FROM appointment_schedulers s
    WHERE s.id = NEW.scheduler_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync bookings to appointments
DROP TRIGGER IF EXISTS sync_booking_trigger ON appointments_booked;
CREATE TRIGGER sync_booking_trigger
  AFTER INSERT ON appointments_booked
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_to_appointments();