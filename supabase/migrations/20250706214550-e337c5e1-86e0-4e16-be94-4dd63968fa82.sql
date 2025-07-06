
-- Create appointment_schedulers table to store scheduler configurations
CREATE TABLE public.appointment_schedulers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  buffer_time INTEGER NOT NULL DEFAULT 15,
  max_advance_booking INTEGER NOT NULL DEFAULT 30,
  min_advance_notice INTEGER NOT NULL DEFAULT 24,
  availability JSONB NOT NULL DEFAULT '[]'::jsonb,
  locations JSONB NOT NULL DEFAULT '{}'::jsonb,
  slug TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.appointment_schedulers ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Allow public access to schedulers for booking (by slug)
CREATE POLICY "Public can view active schedulers by slug" 
  ON public.appointment_schedulers 
  FOR SELECT 
  USING (active = true);

-- Create unique index on slug per user
CREATE UNIQUE INDEX appointment_schedulers_user_slug_idx ON public.appointment_schedulers(user_id, slug);

-- Create appointments_booked table for actual bookings
CREATE TABLE public.appointments_booked (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduler_id UUID REFERENCES public.appointment_schedulers(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for bookings
ALTER TABLE public.appointments_booked ENABLE ROW LEVEL SECURITY;

-- Allow scheduler owners to view bookings
CREATE POLICY "Scheduler owners can view bookings" 
  ON public.appointments_booked 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.appointment_schedulers 
    WHERE appointment_schedulers.id = appointments_booked.scheduler_id 
    AND appointment_schedulers.user_id = auth.uid()
  ));

-- Allow public to create bookings
CREATE POLICY "Public can create bookings" 
  ON public.appointments_booked 
  FOR INSERT 
  WITH CHECK (true);

-- Allow scheduler owners to update/delete bookings
CREATE POLICY "Scheduler owners can manage bookings" 
  ON public.appointments_booked 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.appointment_schedulers 
    WHERE appointment_schedulers.id = appointments_booked.scheduler_id 
    AND appointment_schedulers.user_id = auth.uid()
  ));
