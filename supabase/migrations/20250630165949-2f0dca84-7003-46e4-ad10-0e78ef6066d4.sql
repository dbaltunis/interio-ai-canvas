
-- Create table for window coverings
CREATE TABLE public.window_coverings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  base_making_cost NUMERIC NOT NULL DEFAULT 0,
  fabric_calculation_method TEXT NOT NULL DEFAULT 'standard', -- standard, pleated, gathered
  fabric_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  margin_percentage NUMERIC NOT NULL DEFAULT 40.0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for window covering options (headings, borders, tracks, etc.)
CREATE TABLE public.window_covering_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  window_covering_id UUID NOT NULL REFERENCES public.window_coverings(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL, -- heading, border, track, rod, hem, fold, lining, other
  name TEXT NOT NULL,
  description TEXT,
  cost_type TEXT NOT NULL DEFAULT 'per-unit', -- per-unit, per-meter, per-sqm, fixed
  base_cost NUMERIC NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for window covering calculations (user projects)
CREATE TABLE public.window_covering_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id),
  window_covering_id UUID NOT NULL REFERENCES public.window_coverings(id),
  fabric_id TEXT, -- reference to fabric library
  width NUMERIC NOT NULL,
  drop NUMERIC NOT NULL,
  fabric_usage NUMERIC NOT NULL DEFAULT 0,
  fabric_waste NUMERIC NOT NULL DEFAULT 0,
  fabric_cost NUMERIC NOT NULL DEFAULT 0,
  making_cost NUMERIC NOT NULL DEFAULT 0,
  options_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  margin_amount NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  selected_options JSONB DEFAULT '[]',
  measurements JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.window_coverings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.window_covering_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.window_covering_calculations ENABLE ROW LEVEL SECURITY;

-- Window coverings policies
CREATE POLICY "Users can view their own window coverings" 
  ON public.window_coverings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own window coverings" 
  ON public.window_coverings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own window coverings" 
  ON public.window_coverings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own window coverings" 
  ON public.window_coverings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Window covering options policies
CREATE POLICY "Users can view their own window covering options" 
  ON public.window_covering_options 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own window covering options" 
  ON public.window_covering_options 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own window covering options" 
  ON public.window_covering_options 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own window covering options" 
  ON public.window_covering_options 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Window covering calculations policies
CREATE POLICY "Users can view their own window covering calculations" 
  ON public.window_covering_calculations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own window covering calculations" 
  ON public.window_covering_calculations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own window covering calculations" 
  ON public.window_covering_calculations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own window covering calculations" 
  ON public.window_covering_calculations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_window_coverings_updated_at
  BEFORE UPDATE ON public.window_coverings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_window_covering_options_updated_at
  BEFORE UPDATE ON public.window_covering_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_window_covering_calculations_updated_at
  BEFORE UPDATE ON public.window_covering_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
