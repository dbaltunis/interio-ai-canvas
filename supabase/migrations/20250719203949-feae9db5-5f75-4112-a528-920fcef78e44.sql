
-- Create appointment_schedulers table
CREATE TABLE IF NOT EXISTS public.appointment_schedulers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  duration INTEGER DEFAULT 60,
  buffer_time INTEGER DEFAULT 15,
  max_advance_booking INTEGER DEFAULT 30,
  min_advance_notice INTEGER DEFAULT 24,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  availability JSONB DEFAULT '[]'::jsonb,
  locations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointment_schedulers
ALTER TABLE public.appointment_schedulers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointment_schedulers
CREATE POLICY "Users can view their own schedulers" 
  ON public.appointment_schedulers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedulers" 
  ON public.appointment_schedulers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedulers" 
  ON public.appointment_schedulers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedulers" 
  ON public.appointment_schedulers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create public policy for viewing active schedulers by slug (for public booking)
CREATE POLICY "Anyone can view active schedulers by slug" 
  ON public.appointment_schedulers 
  FOR SELECT 
  USING (active = true);

-- Create appointments_booked table for storing bookings
CREATE TABLE IF NOT EXISTS public.appointments_booked (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduler_id UUID REFERENCES public.appointment_schedulers(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location_type TEXT,
  notes TEXT,
  booking_message TEXT,
  customer_timezone TEXT DEFAULT 'UTC',
  appointment_timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointments_booked
ALTER TABLE public.appointments_booked ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments_booked
CREATE POLICY "Scheduler owners can view their bookings" 
  ON public.appointments_booked 
  FOR SELECT 
  USING (
    scheduler_id IN (
      SELECT id FROM public.appointment_schedulers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create bookings" 
  ON public.appointments_booked 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Scheduler owners can update their bookings" 
  ON public.appointments_booked 
  FOR UPDATE 
  USING (
    scheduler_id IN (
      SELECT id FROM public.appointment_schedulers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Scheduler owners can delete their bookings" 
  ON public.appointments_booked 
  FOR DELETE 
  USING (
    scheduler_id IN (
      SELECT id FROM public.appointment_schedulers WHERE user_id = auth.uid()
    )
  );
