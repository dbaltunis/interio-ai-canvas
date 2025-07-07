
-- Create vendors table with enhanced fields
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_type TEXT DEFAULT 'supplier',
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  website TEXT,
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'NET30',
  discount_percentage NUMERIC DEFAULT 0,
  lead_time_days INTEGER DEFAULT 7,
  minimum_order_amount NUMERIC DEFAULT 0,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create collections table for organizing products
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  season TEXT DEFAULT 'All Season',
  year INTEGER DEFAULT EXTRACT(YEAR FROM now()),
  tags JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhance existing inventory table with additional fields
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS product_code TEXT,
ADD COLUMN IF NOT EXISTS pattern_repeat TEXT,
ADD COLUMN IF NOT EXISTS composition TEXT,
ADD COLUMN IF NOT EXISTS fabric_width NUMERIC,
ADD COLUMN IF NOT EXISTS weight_gsm NUMERIC,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS fire_rating TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_stock',
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- Create hardware inventory table
CREATE TABLE IF NOT EXISTS public.hardware_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  product_code TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  material TEXT,
  finish TEXT,
  dimensions JSONB DEFAULT '{}',
  weight_capacity NUMERIC,
  installation_type TEXT,
  compatibility JSONB DEFAULT '[]',
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'each',
  cost_per_unit NUMERIC DEFAULT 0,
  supplier_price NUMERIC DEFAULT 0,
  retail_price NUMERIC DEFAULT 0,
  reorder_point INTEGER DEFAULT 5,
  location TEXT,
  status TEXT DEFAULT 'in_stock',
  tags JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project inventory usage table to track what's used in projects
CREATE TABLE IF NOT EXISTS public.project_inventory_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  hardware_id UUID REFERENCES public.hardware_inventory(id) ON DELETE SET NULL,
  quantity_used NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  usage_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory adjustments table for tracking stock changes
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  hardware_id UUID REFERENCES public.hardware_inventory(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('purchase', 'usage', 'adjustment', 'return', 'damage')),
  quantity_change NUMERIC NOT NULL,
  reason TEXT,
  reference_id UUID, -- Can reference project, quote, or other related record
  reference_type TEXT, -- 'project', 'quote', 'purchase_order', etc.
  cost_per_unit NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vendors" ON public.vendors
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collections" ON public.collections
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for hardware inventory
ALTER TABLE public.hardware_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hardware inventory" ON public.hardware_inventory
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for project inventory usage
ALTER TABLE public.project_inventory_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project inventory usage" ON public.project_inventory_usage
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for inventory adjustments
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own inventory adjustments" ON public.inventory_adjustments
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_inventory_updated_at BEFORE UPDATE ON public.hardware_inventory
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_id ON public.inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_collection_id ON public.inventory(collection_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_hardware_inventory_vendor_id ON public.hardware_inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_hardware_inventory_category ON public.hardware_inventory(category);
CREATE INDEX IF NOT EXISTS idx_project_inventory_usage_project_id ON public.project_inventory_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_inventory_id ON public.inventory_adjustments(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_hardware_id ON public.inventory_adjustments(hardware_id);
