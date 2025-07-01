
-- Create window_covering_option_sub_subcategories table for third level categories
CREATE TABLE IF NOT EXISTS public.window_covering_option_sub_subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  pricing_method text NOT NULL DEFAULT 'per-meter',
  base_price numeric NOT NULL DEFAULT 0,
  fullness_ratio numeric,
  extra_fabric_percentage numeric,
  sort_order integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create window_covering_option_extras table for fourth level (extras/add-ons)
CREATE TABLE IF NOT EXISTS public.window_covering_option_extras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sub_subcategory_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  pricing_method text NOT NULL DEFAULT 'per-item',
  base_price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  image_url text,
  is_required boolean NOT NULL DEFAULT false,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.window_covering_option_sub_subcategories
ADD CONSTRAINT fk_sub_subcategories_subcategory_id 
FOREIGN KEY (subcategory_id) REFERENCES public.window_covering_option_subcategories(id) ON DELETE CASCADE;

ALTER TABLE public.window_covering_option_extras
ADD CONSTRAINT fk_extras_sub_subcategory_id 
FOREIGN KEY (sub_subcategory_id) REFERENCES public.window_covering_option_sub_subcategories(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.window_covering_option_sub_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.window_covering_option_extras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sub_subcategories
CREATE POLICY "Users can view their own sub_subcategories" 
  ON public.window_covering_option_sub_subcategories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sub_subcategories" 
  ON public.window_covering_option_sub_subcategories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sub_subcategories" 
  ON public.window_covering_option_sub_subcategories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sub_subcategories" 
  ON public.window_covering_option_sub_subcategories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for extras
CREATE POLICY "Users can view their own extras" 
  ON public.window_covering_option_extras 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own extras" 
  ON public.window_covering_option_extras 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extras" 
  ON public.window_covering_option_extras 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extras" 
  ON public.window_covering_option_extras 
  FOR DELETE 
  USING (auth.uid() = user_id);
