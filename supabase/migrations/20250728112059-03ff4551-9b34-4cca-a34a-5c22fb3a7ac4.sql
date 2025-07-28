-- Remove the conflicting policies and create cleaner ones
DROP POLICY IF EXISTS "Enable public booking reading" ON appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can view their bookings" ON appointments_booked;

-- Create a single comprehensive SELECT policy
CREATE POLICY "Enable booking viewing" 
ON appointments_booked
FOR SELECT
USING (
  -- Allow anyone to read (for public booking confirmation)
  true OR
  -- Allow scheduler owners to read their bookings
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
);