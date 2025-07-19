
-- Create rooms table for job management
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'living_room',
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create surfaces table (windows, walls, etc.)
CREATE TABLE public.surfaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  room_id UUID NOT NULL,
  name TEXT NOT NULL,
  surface_type TEXT NOT NULL DEFAULT 'window',
  width NUMERIC DEFAULT 60,
  height NUMERIC DEFAULT 48,
  surface_width NUMERIC DEFAULT 60,
  surface_height NUMERIC DEFAULT 48,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatments table (window treatments)
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  room_id UUID NOT NULL,
  window_id UUID NOT NULL,
  treatment_type TEXT NOT NULL DEFAULT 'curtains',
  product_name TEXT,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  hardware TEXT,
  mounting_type TEXT,
  measurements JSONB,
  material_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'planned',
  fabric_details JSONB,
  treatment_details JSONB,
  calculation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unit column to inventory table
ALTER TABLE public.inventory ADD COLUMN unit TEXT DEFAULT 'units';

-- Add RLS policies for rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rooms" 
  ON public.rooms 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms" 
  ON public.rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms" 
  ON public.rooms 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms" 
  ON public.rooms 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for surfaces
ALTER TABLE public.surfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own surfaces" 
  ON public.surfaces 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own surfaces" 
  ON public.surfaces 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surfaces" 
  ON public.surfaces 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surfaces" 
  ON public.surfaces 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own treatments" 
  ON public.treatments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own treatments" 
  ON public.treatments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatments" 
  ON public.treatments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatments" 
  ON public.treatments 
  FOR DELETE 
  USING (auth.uid() = user_id);
