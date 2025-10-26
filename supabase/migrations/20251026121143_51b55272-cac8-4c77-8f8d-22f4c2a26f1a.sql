-- Fix RLS policies on appointments_booked that are causing permission errors
-- Drop all policies that try to access auth.users table
DROP POLICY IF EXISTS "Scheduler owners can view their bookings" ON appointments_booked;
DROP POLICY IF EXISTS "Users can view relevant bookings" ON appointments_booked;

-- Recreate policies using auth.jwt() instead of querying auth.users
CREATE POLICY "Scheduler owners can view their bookings"
ON appointments_booked
FOR SELECT
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
  OR customer_email = (auth.jwt()->>'email')
);

CREATE POLICY "Users can view relevant bookings"
ON appointments_booked
FOR SELECT
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
  OR customer_email = (auth.jwt()->>'email')
);