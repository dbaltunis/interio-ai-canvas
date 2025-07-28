-- Fix RLS policy for public booking creation
DROP POLICY IF EXISTS "Anyone can create bookings" ON appointments_booked;

-- Create a proper policy that allows anonymous users to create bookings
CREATE POLICY "Enable public booking creation"
ON appointments_booked
FOR INSERT
WITH CHECK (true);

-- Also ensure we have a policy for reading bookings (needed for the booking confirmation)
CREATE POLICY "Enable public booking reading" 
ON appointments_booked
FOR SELECT
USING (true);