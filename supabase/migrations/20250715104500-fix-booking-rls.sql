
-- Drop and recreate the public booking policy to ensure it works correctly
DROP POLICY IF EXISTS "Public can create bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.appointments_booked;

-- Create a policy that explicitly allows anonymous users to create bookings
CREATE POLICY "Allow public booking creation" 
  ON public.appointments_booked 
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Ensure the table has the correct RLS setup
ALTER TABLE public.appointments_booked ENABLE ROW LEVEL SECURITY;
