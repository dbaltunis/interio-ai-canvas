-- Fix the user_id issue by making it optional in the table
ALTER TABLE public.heading_options ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.heading_options ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Create tables for other component types
CREATE TABLE public.hardware_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-meter',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lining_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-meter',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pricing_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  name TEXT NOT NULL,
  grid_data JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.trimming_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-meter',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hardware_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lining_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trimming_options ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
CREATE POLICY "Users can manage their own hardware options" 
ON public.hardware_options FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lining options" 
ON public.lining_options FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pricing grids" 
ON public.pricing_grids FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own trimming options" 
ON public.trimming_options FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_hardware_options_updated_at
BEFORE UPDATE ON public.hardware_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lining_options_updated_at
BEFORE UPDATE ON public.lining_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_grids_updated_at
BEFORE UPDATE ON public.pricing_grids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trimming_options_updated_at
BEFORE UPDATE ON public.trimming_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();