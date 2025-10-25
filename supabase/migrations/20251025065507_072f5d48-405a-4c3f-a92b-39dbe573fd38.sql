-- Simple fix for appointments_booked RLS without complex joins

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view appointments through their schedulers" ON appointments_booked;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments_booked;
DROP POLICY IF EXISTS "Users can view their own schedulers" ON appointment_schedulers;
DROP POLICY IF EXISTS "Public can view active schedulers" ON appointment_schedulers;

-- Create simple, non-conflicting policies
CREATE POLICY "View own appointments"
ON appointments_booked
FOR SELECT
TO authenticated
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Create appointments"
ON appointments_booked
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "View own schedulers"
ON appointment_schedulers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR active = true);