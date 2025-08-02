-- Create window_coverings table
CREATE TABLE public.window_coverings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.window_coverings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_window_coverings_updated_at
BEFORE UPDATE ON public.window_coverings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();