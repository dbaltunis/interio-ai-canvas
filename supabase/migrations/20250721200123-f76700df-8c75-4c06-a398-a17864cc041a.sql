
-- Create product_orders table to store items that need to be ordered
CREATE TABLE public.product_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('fabric', 'hardware', 'track', 'accessory', 'lining', 'other')),
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  vendor_id UUID,
  order_status TEXT NOT NULL DEFAULT 'to_order' CHECK (order_status IN ('to_order', 'ordered', 'received', 'cancelled')),
  planned_order_date DATE,
  actual_order_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table to store vendor information
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
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
  payment_terms TEXT,
  lead_time_days INTEGER DEFAULT 7,
  minimum_order_amount NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for vendor_id in product_orders
ALTER TABLE public.product_orders 
ADD CONSTRAINT fk_product_orders_vendor 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

-- Enable Row Level Security
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_orders
CREATE POLICY "Users can view their own product orders" 
  ON public.product_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product orders" 
  ON public.product_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product orders" 
  ON public.product_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product orders" 
  ON public.product_orders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for vendors
CREATE POLICY "Users can view their own vendors" 
  ON public.vendors 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors" 
  ON public.vendors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors" 
  ON public.vendors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors" 
  ON public.vendors 
  FOR DELETE 
  USING (auth.uid() = user_id);
