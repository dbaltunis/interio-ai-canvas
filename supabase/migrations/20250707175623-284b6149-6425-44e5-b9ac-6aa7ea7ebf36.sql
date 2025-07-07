
-- Create a table for service options
CREATE TABLE public.service_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-window',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;

-- Create policies for service options
CREATE POLICY "Users can manage their own service options" 
  ON public.service_options 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to automatically set user_id
CREATE OR REPLACE FUNCTION public.set_user_id_service_options()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_id_service_options_trigger
  BEFORE INSERT ON public.service_options
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_service_options();

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_service_options_updated_at
  BEFORE UPDATE ON public.service_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
