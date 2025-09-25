-- Create making costs table first
CREATE TABLE public.making_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL, -- 'curtains', 'roman_blinds', 'roller_blinds', etc.
  pricing_method TEXT DEFAULT 'per_metre',
  measurement_type TEXT DEFAULT 'standard',
  base_price NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  waste_factor NUMERIC DEFAULT 5,
  minimum_charge NUMERIC DEFAULT 0,
  options JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create option categories table for hierarchical product options
CREATE TABLE public.option_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_type TEXT NOT NULL DEFAULT 'heading', -- 'heading', 'lining', 'hardware', 'operation', 'material'
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  has_fullness_ratio BOOLEAN DEFAULT false,
  fullness_ratio NUMERIC DEFAULT 1.0,
  calculation_method TEXT DEFAULT 'fixed', -- 'per-unit', 'per-linear-meter', 'per-linear-yard', 'per-sqm', 'fixed', 'percentage'
  affects_fabric_calculation BOOLEAN DEFAULT false,
  affects_labor_calculation BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create option subcategories table
CREATE TABLE public.option_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.option_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_method TEXT NOT NULL DEFAULT 'fixed', -- 'per-unit', 'per-meter', 'per-sqm', 'fixed', 'percentage'
  base_price NUMERIC DEFAULT 0,
  fullness_ratio NUMERIC DEFAULT 1.0,
  extra_fabric_percentage NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  calculation_method TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create option sub-subcategories table
CREATE TABLE public.option_sub_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES public.option_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_method TEXT NOT NULL DEFAULT 'fixed', -- 'per-unit', 'per-meter', 'per-sqm', 'fixed', 'percentage'
  base_price NUMERIC DEFAULT 0,
  fullness_ratio NUMERIC DEFAULT 1.0,
  extra_fabric_percentage NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  calculation_method TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create option extras table
CREATE TABLE public.option_extras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sub_subcategory_id UUID NOT NULL REFERENCES public.option_sub_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_method TEXT NOT NULL DEFAULT 'fixed', -- 'per-unit', 'per-meter', 'per-sqm', 'fixed', 'percentage', 'per-item'
  base_price NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  is_required BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  fullness_ratio NUMERIC DEFAULT 1.0,
  calculation_method TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create making cost option mappings table
CREATE TABLE public.making_cost_option_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  making_cost_id UUID NOT NULL REFERENCES public.making_costs(id) ON DELETE CASCADE,
  option_category_id UUID NOT NULL REFERENCES public.option_categories(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL DEFAULT 'heading', -- 'heading', 'hardware', 'lining', 'operation', 'material'
  is_included BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(making_cost_id, option_category_id)
);

-- Enable RLS
ALTER TABLE public.making_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_sub_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.making_cost_option_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for making_costs
CREATE POLICY "Users can view account making costs" ON public.making_costs
  FOR SELECT USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create making costs" ON public.making_costs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update making costs" ON public.making_costs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete making costs" ON public.making_costs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for option_categories
CREATE POLICY "Users can view account option categories" ON public.option_categories
  FOR SELECT USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create option categories" ON public.option_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update option categories" ON public.option_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete option categories" ON public.option_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for option_subcategories
CREATE POLICY "Users can view option subcategories" ON public.option_subcategories
  FOR SELECT USING (category_id IN (
    SELECT id FROM public.option_categories 
    WHERE get_account_owner(auth.uid()) = get_account_owner(user_id)
  ));

CREATE POLICY "Users can create option subcategories" ON public.option_subcategories
  FOR INSERT WITH CHECK (category_id IN (
    SELECT id FROM public.option_categories WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update option subcategories" ON public.option_subcategories
  FOR UPDATE USING (category_id IN (
    SELECT id FROM public.option_categories WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete option subcategories" ON public.option_subcategories
  FOR DELETE USING (category_id IN (
    SELECT id FROM public.option_categories WHERE user_id = auth.uid()
  ));

-- Create RLS policies for option_sub_subcategories
CREATE POLICY "Users can view option sub-subcategories" ON public.option_sub_subcategories
  FOR SELECT USING (subcategory_id IN (
    SELECT os.id FROM public.option_subcategories os
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE get_account_owner(auth.uid()) = get_account_owner(oc.user_id)
  ));

CREATE POLICY "Users can create option sub-subcategories" ON public.option_sub_subcategories
  FOR INSERT WITH CHECK (subcategory_id IN (
    SELECT os.id FROM public.option_subcategories os
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update option sub-subcategories" ON public.option_sub_subcategories
  FOR UPDATE USING (subcategory_id IN (
    SELECT os.id FROM public.option_subcategories os
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete option sub-subcategories" ON public.option_sub_subcategories
  FOR DELETE USING (subcategory_id IN (
    SELECT os.id FROM public.option_subcategories os
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

-- Create RLS policies for option_extras
CREATE POLICY "Users can view option extras" ON public.option_extras
  FOR SELECT USING (sub_subcategory_id IN (
    SELECT oss.id FROM public.option_sub_subcategories oss
    JOIN public.option_subcategories os ON oss.subcategory_id = os.id
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE get_account_owner(auth.uid()) = get_account_owner(oc.user_id)
  ));

CREATE POLICY "Users can create option extras" ON public.option_extras
  FOR INSERT WITH CHECK (sub_subcategory_id IN (
    SELECT oss.id FROM public.option_sub_subcategories oss
    JOIN public.option_subcategories os ON oss.subcategory_id = os.id
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update option extras" ON public.option_extras
  FOR UPDATE USING (sub_subcategory_id IN (
    SELECT oss.id FROM public.option_sub_subcategories oss
    JOIN public.option_subcategories os ON oss.subcategory_id = os.id
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete option extras" ON public.option_extras
  FOR DELETE USING (sub_subcategory_id IN (
    SELECT oss.id FROM public.option_sub_subcategories oss
    JOIN public.option_subcategories os ON oss.subcategory_id = os.id
    JOIN public.option_categories oc ON os.category_id = oc.id
    WHERE oc.user_id = auth.uid()
  ));

-- Create RLS policies for making_cost_option_mappings
CREATE POLICY "Users can view making cost option mappings" ON public.making_cost_option_mappings
  FOR SELECT USING (making_cost_id IN (
    SELECT id FROM public.making_costs 
    WHERE get_account_owner(auth.uid()) = get_account_owner(user_id)
  ));

CREATE POLICY "Users can create making cost option mappings" ON public.making_cost_option_mappings
  FOR INSERT WITH CHECK (making_cost_id IN (
    SELECT id FROM public.making_costs WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update making cost option mappings" ON public.making_cost_option_mappings
  FOR UPDATE USING (making_cost_id IN (
    SELECT id FROM public.making_costs WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete making cost option mappings" ON public.making_cost_option_mappings
  FOR DELETE USING (making_cost_id IN (
    SELECT id FROM public.making_costs WHERE user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_making_costs_user_id ON public.making_costs(user_id);
CREATE INDEX idx_making_costs_product_type ON public.making_costs(product_type);
CREATE INDEX idx_option_categories_user_id ON public.option_categories(user_id);
CREATE INDEX idx_option_categories_category_type ON public.option_categories(category_type);
CREATE INDEX idx_option_subcategories_category_id ON public.option_subcategories(category_id);
CREATE INDEX idx_option_sub_subcategories_subcategory_id ON public.option_sub_subcategories(subcategory_id);
CREATE INDEX idx_option_extras_sub_subcategory_id ON public.option_extras(sub_subcategory_id);
CREATE INDEX idx_making_cost_option_mappings_making_cost_id ON public.making_cost_option_mappings(making_cost_id);
CREATE INDEX idx_making_cost_option_mappings_option_category_id ON public.making_cost_option_mappings(option_category_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_making_costs_updated_at
  BEFORE UPDATE ON public.making_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_option_categories_updated_at
  BEFORE UPDATE ON public.option_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_option_subcategories_updated_at
  BEFORE UPDATE ON public.option_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_option_sub_subcategories_updated_at
  BEFORE UPDATE ON public.option_sub_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_option_extras_updated_at
  BEFORE UPDATE ON public.option_extras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_making_cost_option_mappings_updated_at
  BEFORE UPDATE ON public.making_cost_option_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();