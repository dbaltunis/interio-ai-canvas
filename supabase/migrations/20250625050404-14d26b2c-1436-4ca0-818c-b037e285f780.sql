
-- Create work_order_items table to store individual work order line items
CREATE TABLE public.work_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL,
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  hardware TEXT,
  measurements JSONB,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  supplier TEXT,
  fabric_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create work_order_checkpoints table for task management
CREATE TABLE public.work_order_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  assigned_to TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create fabric_orders table for supplier ordering
CREATE TABLE public.fabric_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fabric_code TEXT NOT NULL,
  fabric_type TEXT NOT NULL,
  color TEXT,
  pattern TEXT,
  supplier TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'yard',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'needed',
  order_date DATE,
  expected_delivery DATE,
  received_date DATE,
  work_order_ids TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create team_members table for task delegation
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  skills TEXT[],
  email TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  hourly_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.work_order_items 
ADD CONSTRAINT fk_work_order_items_work_order 
FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;

ALTER TABLE public.work_order_checkpoints 
ADD CONSTRAINT fk_work_order_checkpoints_work_order 
FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_work_order_items_work_order_id ON public.work_order_items(work_order_id);
CREATE INDEX idx_work_order_items_status ON public.work_order_items(status);
CREATE INDEX idx_work_order_checkpoints_work_order_id ON public.work_order_checkpoints(work_order_id);
CREATE INDEX idx_fabric_orders_supplier ON public.fabric_orders(supplier);
CREATE INDEX idx_fabric_orders_status ON public.fabric_orders(status);
CREATE INDEX idx_team_members_active ON public.team_members(active);

-- Enable RLS on all new tables
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_order_items
CREATE POLICY "Users can view their own work order items" 
  ON public.work_order_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work order items" 
  ON public.work_order_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work order items" 
  ON public.work_order_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work order items" 
  ON public.work_order_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for work_order_checkpoints
CREATE POLICY "Users can view their own work order checkpoints" 
  ON public.work_order_checkpoints 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work order checkpoints" 
  ON public.work_order_checkpoints 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work order checkpoints" 
  ON public.work_order_checkpoints 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work order checkpoints" 
  ON public.work_order_checkpoints 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for fabric_orders
CREATE POLICY "Users can view their own fabric orders" 
  ON public.fabric_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fabric orders" 
  ON public.fabric_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fabric orders" 
  ON public.fabric_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fabric orders" 
  ON public.fabric_orders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for team_members
CREATE POLICY "Users can view their own team members" 
  ON public.team_members 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members" 
  ON public.team_members 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members" 
  ON public.team_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_work_order_items_updated_at
  BEFORE UPDATE ON public.work_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_order_checkpoints_updated_at
  BEFORE UPDATE ON public.work_order_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fabric_orders_updated_at
  BEFORE UPDATE ON public.fabric_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
