-- Fix RLS policies for appointments_booked table to allow public booking

-- First, enable RLS if not already enabled
ALTER TABLE public.appointments_booked ENABLE ROW LEVEL SECURITY;

-- Allow public insert for booking confirmations (no authentication required)
CREATE POLICY "Allow public booking creation" 
ON public.appointments_booked 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own bookings and scheduler owners to view bookings for their schedulers
CREATE POLICY "Users can view relevant bookings" 
ON public.appointments_booked 
FOR SELECT 
USING (
  -- Users can see their own bookings based on email
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR 
  -- Scheduler owners can see bookings for their schedulers
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update bookings for their schedulers
CREATE POLICY "Scheduler owners can update bookings" 
ON public.appointments_booked 
FOR UPDATE 
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete bookings for their schedulers
CREATE POLICY "Scheduler owners can delete bookings" 
ON public.appointments_booked 
FOR DELETE 
USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  )
);