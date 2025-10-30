-- Phase 1: Fix booking failure by removing problematic sync trigger
-- The sync_booking_to_appointments() function tries to reference fields that don't exist

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS sync_booking_trigger ON appointments_booked;

-- Drop the problematic function
DROP FUNCTION IF EXISTS sync_booking_to_appointments();

-- The send_booking_confirmation trigger and function will remain active
-- as they work correctly with the existing schema