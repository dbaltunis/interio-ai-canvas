
-- Create a table to store which option categories are attached to which window coverings
CREATE TABLE public.window_covering_option_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  window_covering_id UUID NOT NULL,
  category_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(window_covering_id, category_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.window_covering_option_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for the assignments table
CREATE POLICY "Users can create their own option assignments" 
  ON public.window_covering_option_assignments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own option assignments" 
  ON public.window_covering_option_assignments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own option assignments" 
  ON public.window_covering_option_assignments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_window_covering_option_assignments_updated_at
  BEFORE UPDATE ON public.window_covering_option_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
