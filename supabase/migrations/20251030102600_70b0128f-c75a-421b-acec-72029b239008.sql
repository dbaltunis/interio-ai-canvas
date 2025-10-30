-- Remove the problematic booking confirmation trigger
-- The create-booking edge function already handles email notifications
-- This trigger was causing failures due to missing database settings

DROP TRIGGER IF EXISTS booking_confirmation_trigger ON appointments_booked;
DROP TRIGGER IF EXISTS send_booking_confirmation_trigger ON appointments_booked;

-- Drop the function as well since it's no longer needed
DROP FUNCTION IF EXISTS send_booking_confirmation();