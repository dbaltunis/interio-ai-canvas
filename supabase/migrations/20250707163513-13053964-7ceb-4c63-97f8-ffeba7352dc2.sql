-- Create a table for custom heading options
CREATE TABLE public.heading_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  fullness NUMERIC NOT NULL DEFAULT 2.0,
  price NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'standard',
  extras JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.heading_options ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own heading options" 
ON public.heading_options 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_heading_options_updated_at
BEFORE UPDATE ON public.heading_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();