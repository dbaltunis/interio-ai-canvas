-- Fix RLS for appointment_schedulers, appointments_booked, and default_inventory_templates

-- ============================================
-- appointment_schedulers
-- ============================================
DROP POLICY IF EXISTS "Users can delete schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can create schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Owners and admins can view schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "View own schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "read appointment_schedulers" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can update schedulers" ON public.appointment_schedulers;

CREATE POLICY "Account isolation - SELECT" ON public.appointment_schedulers
  FOR SELECT
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - INSERT" ON public.appointment_schedulers
  FOR INSERT
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - UPDATE" ON public.appointment_schedulers
  FOR UPDATE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - DELETE" ON public.appointment_schedulers
  FOR DELETE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

-- ============================================
-- appointments_booked
-- ============================================
DROP POLICY IF EXISTS "Scheduler owners can delete bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can delete their bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Allow public booking creation" ON public.appointments_booked;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Create appointments" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can view their bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Users can view relevant bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "View own appointments" ON public.appointments_booked;
DROP POLICY IF EXISTS "read appointments_booked" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can update bookings" ON public.appointments_booked;
DROP POLICY IF EXISTS "Scheduler owners can update their bookings" ON public.appointments_booked;

-- Bookings are accessed via scheduler, so check scheduler ownership
CREATE POLICY "Account isolation - SELECT" ON public.appointments_booked
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointment_schedulers s
      WHERE s.id = appointments_booked.scheduler_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(s.user_id)
    )
  );

-- Allow public to insert bookings (this is customer-facing)
CREATE POLICY "Public can create bookings" ON public.appointments_booked
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Account isolation - UPDATE" ON public.appointments_booked
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.appointment_schedulers s
      WHERE s.id = appointments_booked.scheduler_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(s.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointment_schedulers s
      WHERE s.id = appointments_booked.scheduler_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(s.user_id)
    )
  );

CREATE POLICY "Account isolation - DELETE" ON public.appointments_booked
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.appointment_schedulers s
      WHERE s.id = appointments_booked.scheduler_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(s.user_id)
    )
  );

-- ============================================
-- default_inventory_templates
-- ============================================
DROP POLICY IF EXISTS "All users can view default templates" ON public.default_inventory_templates;