
-- Create parts_options table for managing curtain and blind components
CREATE TABLE public.parts_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-piece',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.parts_options ENABLE ROW LEVEL SECURITY;

-- Create policies for parts_options
CREATE POLICY "Users can view their own parts options" 
  ON public.parts_options 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parts options" 
  ON public.parts_options 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parts options" 
  ON public.parts_options 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parts options" 
  ON public.parts_options 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_parts_options_updated_at
  BEFORE UPDATE ON public.parts_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
