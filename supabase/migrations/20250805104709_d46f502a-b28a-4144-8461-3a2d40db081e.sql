-- Add calendar privacy controls by updating calendar queries to filter by user
-- Update appointments and calendar data to be user-scoped

-- Update appointments RLS to ensure better privacy
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;
CREATE POLICY "Users can view appointments" ON public.appointments
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = ANY(team_member_ids) OR
  auth.uid() IN (
    SELECT shared_with_user_id FROM appointment_shares 
    WHERE appointment_id = appointments.id
  ) OR
  public.is_admin()
);

-- Update caldav_calendars to ensure proper user isolation  
DROP POLICY IF EXISTS "Users can view calendars from their accounts" ON public.caldav_calendars;
CREATE POLICY "Users can view calendars from their accounts" ON public.caldav_calendars
FOR SELECT USING (
  account_id IN (
    SELECT id FROM caldav_accounts 
    WHERE user_id = auth.uid()
  )
);

-- Ensure appointments_booked are properly scoped
DROP POLICY IF EXISTS "Users can view relevant bookings" ON public.appointments_booked;
CREATE POLICY "Users can view relevant bookings" ON public.appointments_booked
FOR SELECT USING (
  scheduler_id IN (
    SELECT id FROM appointment_schedulers 
    WHERE user_id = auth.uid()
  ) OR
  customer_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )::text
);