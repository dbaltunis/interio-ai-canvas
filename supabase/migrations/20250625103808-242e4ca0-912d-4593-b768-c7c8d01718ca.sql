
-- Create business configuration settings table
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT,
  abn TEXT,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  default_tax_rate DECIMAL(5,2) DEFAULT 10.00,
  default_markup DECIMAL(5,2) DEFAULT 40.00,
  labor_rate DECIMAL(8,2) DEFAULT 85.00,
  quote_validity_days INTEGER DEFAULT 30,
  installation_lead_days INTEGER DEFAULT 14,
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '17:00',
  auto_generate_work_orders BOOLEAN DEFAULT true,
  auto_calculate_fabric BOOLEAN DEFAULT true,
  email_quote_notifications BOOLEAN DEFAULT false,
  low_stock_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  markup_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table with comprehensive configuration
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2),
  markup_percentage DECIMAL(5,2),
  unit TEXT DEFAULT 'each',
  variants JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  lead_time_days INTEGER DEFAULT 7,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  product_categories TEXT[] DEFAULT '{}',
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor products table for vendor-specific pricing
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_sku TEXT,
  vendor_price DECIMAL(10,2),
  minimum_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  availability_status TEXT DEFAULT 'available',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, product_id)
);

-- Create treatment types table
CREATE TABLE public.treatment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  estimated_hours DECIMAL(5,2) DEFAULT 0,
  complexity TEXT DEFAULT 'Medium' CHECK (complexity IN ('Low', 'Medium', 'High')),
  labor_rate DECIMAL(8,2),
  required_materials JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('percentage', 'fixed_amount', 'formula')),
  value DECIMAL(10,2),
  formula TEXT,
  conditions JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calculation formulas table
CREATE TABLE public.calculation_formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  formula_expression TEXT NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration settings table
CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  integration_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  api_credentials JSONB DEFAULT '{}',
  sync_settings JSONB DEFAULT '{}',
  webhook_url TEXT,
  active BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_type)
);

-- Enable Row Level Security
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_settings
CREATE POLICY "Users can view their own business settings" 
  ON public.business_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business settings" 
  ON public.business_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings" 
  ON public.business_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for product_categories
CREATE POLICY "Users can manage their own product categories" 
  ON public.product_categories FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for products
CREATE POLICY "Users can manage their own products" 
  ON public.products FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for vendors
CREATE POLICY "Users can manage their own vendors" 
  ON public.vendors FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for vendor_products
CREATE POLICY "Users can manage their own vendor products" 
  ON public.vendor_products FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for treatment_types
CREATE POLICY "Users can manage their own treatment types" 
  ON public.treatment_types FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pricing_rules
CREATE POLICY "Users can manage their own pricing rules" 
  ON public.pricing_rules FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for calculation_formulas
CREATE POLICY "Users can manage their own calculation formulas" 
  ON public.calculation_formulas FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for integration_settings
CREATE POLICY "Users can manage their own integration settings" 
  ON public.integration_settings FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_business_settings_updated_at 
  BEFORE UPDATE ON public.business_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at 
  BEFORE UPDATE ON public.product_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON public.vendors 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_types_updated_at 
  BEFORE UPDATE ON public.treatment_types 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at 
  BEFORE UPDATE ON public.pricing_rules 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calculation_formulas_updated_at 
  BEFORE UPDATE ON public.calculation_formulas 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at 
  BEFORE UPDATE ON public.integration_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_business_settings_user_id ON public.business_settings(user_id);
CREATE INDEX idx_product_categories_user_id ON public.product_categories(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendor_products_vendor_id ON public.vendor_products(vendor_id);
CREATE INDEX idx_vendor_products_product_id ON public.vendor_products(product_id);
CREATE INDEX idx_treatment_types_user_id ON public.treatment_types(user_id);
CREATE INDEX idx_treatment_types_category ON public.treatment_types(category);
CREATE INDEX idx_pricing_rules_user_id ON public.pricing_rules(user_id);
CREATE INDEX idx_pricing_rules_category ON public.pricing_rules(category);
CREATE INDEX idx_calculation_formulas_user_id ON public.calculation_formulas(user_id);
CREATE INDEX idx_integration_settings_user_id ON public.integration_settings(user_id);
CREATE INDEX idx_integration_settings_type ON public.integration_settings(integration_type);
