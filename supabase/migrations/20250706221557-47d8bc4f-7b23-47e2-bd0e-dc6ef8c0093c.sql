
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Public can create bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can manage bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can view bookings" ON public.appointments_booked;

-- Create a clear policy for public booking creation
CREATE POLICY "Anyone can create bookings" 
  ON public.appointments_booked 
  FOR INSERT 
  WITH CHECK (true);

-- Allow scheduler owners to view their bookings
CREATE POLICY "Scheduler owners can view bookings" 
  ON public.appointments_booked 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.appointment_schedulers 
    WHERE appointment_schedulers.id = appointments_booked.scheduler_id 
    AND appointment_schedulers.user_id = auth.uid()
  ));

-- Allow scheduler owners to update/delete their bookings
CREATE POLICY "Scheduler owners can update bookings" 
  ON public.appointments_booked 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.appointment_schedulers 
    WHERE appointment_schedulers.id = appointments_booked.scheduler_id 
    AND appointment_schedulers.user_id = auth.uid()
  ));

CREATE POLICY "Scheduler owners can delete bookings" 
  ON public.appointments_booked 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.appointment_schedulers 
    WHERE appointment_schedulers.id = appointments_booked.scheduler_id 
    AND appointment_schedulers.user_id = auth.uid()
  ));
