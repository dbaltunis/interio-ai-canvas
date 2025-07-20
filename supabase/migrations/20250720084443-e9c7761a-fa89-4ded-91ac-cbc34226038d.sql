
-- Add missing column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;

-- Add missing columns to emails table  
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to inventory table
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0;

-- Add missing column to surfaces table
ALTER TABLE public.surfaces ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create business_settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT,
  abn TEXT,
  business_email TEXT,
  business_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Australia',
  company_logo_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for business_settings
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_settings
CREATE POLICY IF NOT EXISTS "Users can view their own business settings" 
  ON public.business_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own business settings" 
  ON public.business_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own business settings" 
  ON public.business_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create work_orders table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID,
  order_number TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  instructions TEXT,
  notes TEXT,
  estimated_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for work_orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_orders
CREATE POLICY IF NOT EXISTS "Users can manage their own work orders" 
  ON public.work_orders 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create fabric_orders table
CREATE TABLE IF NOT EXISTS public.fabric_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fabric_code TEXT NOT NULL,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  supplier TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'meters',
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'needed',
  order_date TEXT,
  expected_delivery TEXT,
  received_date TEXT,
  work_order_ids JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fabric_orders
ALTER TABLE public.fabric_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fabric_orders
CREATE POLICY IF NOT EXISTS "Users can manage their own fabric orders" 
  ON public.fabric_orders 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create product_templates table
CREATE TABLE IF NOT EXISTS public.product_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  treatment_type TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_category TEXT,
  calculation_method TEXT,
  pricing_grid_id TEXT,
  active BOOLEAN DEFAULT true,
  components JSONB DEFAULT '{}',
  calculation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for product_templates
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_templates
CREATE POLICY IF NOT EXISTS "Users can manage their own product templates" 
  ON public.product_templates 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update shopify_integrations table to add missing column
ALTER TABLE public.shopify_integrations ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for new tables
CREATE TRIGGER IF NOT EXISTS update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_fabric_orders_updated_at
  BEFORE UPDATE ON public.fabric_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_product_templates_updated_at
  BEFORE UPDATE ON public.product_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
