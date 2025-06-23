
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'measuring', 'quoted', 'approved', 'in-production', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote items table
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  treatment_type TEXT,
  fabric_type TEXT,
  measurements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT NOT NULL CHECK (category IN ('fabric', 'hardware', 'trim', 'cord', 'motor', 'bracket', 'tool', 'other')),
  type TEXT,
  color TEXT,
  pattern TEXT,
  width DECIMAL(8,2),
  length DECIMAL(8,2),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'yard',
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  location TEXT,
  reorder_point DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work orders table
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'on-hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  instructions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('consultation', 'measurement', 'installation', 'follow-up', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for clients
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quotes
CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quotes" ON public.quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quote items
CREATE POLICY "Users can view own quote items" ON public.quote_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can create own quote items" ON public.quote_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can update own quote items" ON public.quote_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can delete own quote items" ON public.quote_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));

-- Create RLS policies for inventory
CREATE POLICY "Users can view own inventory" ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inventory" ON public.inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.inventory
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON public.inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for work orders
CREATE POLICY "Users can view own work orders" ON public.work_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own work orders" ON public.work_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work orders" ON public.work_orders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own work orders" ON public.work_orders
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_project_id ON public.quotes(project_id);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_work_orders_user_id ON public.work_orders(user_id);
CREATE INDEX idx_work_orders_project_id ON public.work_orders(project_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
