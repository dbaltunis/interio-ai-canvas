-- Send booking confirmation email
create or replace function send_booking_confirmation()
returns trigger as $$
begin
  -- Only send for new confirmed bookings
  if TG_OP = 'INSERT' AND NEW.status = 'confirmed' then
    -- Call the edge function to send confirmation email
    perform
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
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;