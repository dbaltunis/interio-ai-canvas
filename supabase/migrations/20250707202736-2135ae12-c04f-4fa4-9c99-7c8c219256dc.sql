
-- Create pricing_grids table to store CSV pricing data
CREATE TABLE IF NOT EXISTS public.pricing_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  grid_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.pricing_grids ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing_grids
CREATE POLICY "Users can view their own pricing grids" 
  ON public.pricing_grids 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pricing grids" 
  ON public.pricing_grids 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing grids" 
  ON public.pricing_grids 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing grids" 
  ON public.pricing_grids 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_pricing_grids_updated_at
  BEFORE UPDATE ON public.pricing_grids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
