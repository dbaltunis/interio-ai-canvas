
-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT,
  measurements JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create windows table
CREATE TABLE public.windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  width DECIMAL(8,2),
  height DECIMAL(8,2),
  depth DECIMAL(8,2),
  window_type TEXT,
  location TEXT,
  measurements JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  window_id UUID REFERENCES public.windows(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  treatment_type TEXT NOT NULL,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  hardware TEXT,
  mounting_type TEXT,
  measurements JSONB,
  quantity DECIMAL(8,2) DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'in-production', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rooms
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

-- Create RLS policies for windows
CREATE POLICY "Users can view their own windows" 
  ON public.windows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own windows" 
  ON public.windows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own windows" 
  ON public.windows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own windows" 
  ON public.windows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for treatments
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

-- Create indexes for better performance
CREATE INDEX idx_rooms_project_id ON public.rooms(project_id);
CREATE INDEX idx_rooms_user_id ON public.rooms(user_id);
CREATE INDEX idx_windows_room_id ON public.windows(room_id);
CREATE INDEX idx_windows_project_id ON public.windows(project_id);
CREATE INDEX idx_windows_user_id ON public.windows(user_id);
CREATE INDEX idx_treatments_window_id ON public.treatments(window_id);
CREATE INDEX idx_treatments_room_id ON public.treatments(room_id);
CREATE INDEX idx_treatments_project_id ON public.treatments(project_id);
CREATE INDEX idx_treatments_user_id ON public.treatments(user_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON public.rooms 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_windows_updated_at 
  BEFORE UPDATE ON public.windows 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at 
  BEFORE UPDATE ON public.treatments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
