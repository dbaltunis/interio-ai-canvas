
-- Create window_covering_option_categories table
CREATE TABLE IF NOT EXISTS public.window_covering_option_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create window_covering_option_subcategories table  
CREATE TABLE IF NOT EXISTS public.window_covering_option_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.window_covering_option_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_method TEXT NOT NULL CHECK (pricing_method IN ('per-unit', 'per-meter', 'per-sqm', 'fixed', 'percentage')),
  base_price NUMERIC NOT NULL DEFAULT 0,
  fullness_ratio NUMERIC,
  extra_fabric_percentage NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update the existing window_coverings table to match the current interface
ALTER TABLE public.window_coverings 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS fabrication_pricing_method TEXT CHECK (fabrication_pricing_method IN ('per-panel', 'per-drop', 'per-meter', 'per-yard', 'pricing-grid')),
ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_grid_data TEXT;

-- Remove the old columns that are no longer used
ALTER TABLE public.window_coverings 
DROP COLUMN IF EXISTS fabric_calculation_method,
DROP COLUMN IF EXISTS base_making_cost,
DROP COLUMN IF EXISTS fabric_multiplier;

-- Update the existing window_covering_options table to match current interface
ALTER TABLE public.window_covering_options 
ALTER COLUMN cost_type TYPE TEXT,
ADD CONSTRAINT window_covering_options_cost_type_check 
CHECK (cost_type IN ('per-unit', 'per-meter', 'per-sqm', 'fixed', 'percentage'));

-- Enable Row Level Security
ALTER TABLE public.window_covering_option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.window_covering_option_subcategories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for window_covering_option_categories
CREATE POLICY "Users can view their own option categories" 
  ON public.window_covering_option_categories 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own option categories" 
  ON public.window_covering_option_categories 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own option categories" 
  ON public.window_covering_option_categories 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own option categories" 
  ON public.window_covering_option_categories 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create RLS policies for window_covering_option_subcategories
CREATE POLICY "Users can view their own option subcategories" 
  ON public.window_covering_option_subcategories 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own option subcategories" 
  ON public.window_covering_option_subcategories 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own option subcategories" 
  ON public.window_covering_option_subcategories 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own option subcategories" 
  ON public.window_covering_option_subcategories 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for existing tables if they don't exist
DO $$ 
BEGIN
  -- Check if RLS is enabled on window_coverings
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'window_coverings' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.window_coverings ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on window_covering_options
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'window_covering_options' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.window_covering_options ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies for window_coverings if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_coverings' 
    AND policyname = 'Users can view their own window coverings'
  ) THEN
    CREATE POLICY "Users can view their own window coverings" 
      ON public.window_coverings 
      FOR SELECT 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_coverings' 
    AND policyname = 'Users can create their own window coverings'
  ) THEN
    CREATE POLICY "Users can create their own window coverings" 
      ON public.window_coverings 
      FOR INSERT 
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_coverings' 
    AND policyname = 'Users can update their own window coverings'
  ) THEN
    CREATE POLICY "Users can update their own window coverings" 
      ON public.window_coverings 
      FOR UPDATE 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_coverings' 
    AND policyname = 'Users can delete their own window coverings'
  ) THEN
    CREATE POLICY "Users can delete their own window coverings" 
      ON public.window_coverings 
      FOR DELETE 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create RLS policies for window_covering_options if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_covering_options' 
    AND policyname = 'Users can view their own window covering options'
  ) THEN
    CREATE POLICY "Users can view their own window covering options" 
      ON public.window_covering_options 
      FOR SELECT 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_covering_options' 
    AND policyname = 'Users can create their own window covering options'
  ) THEN
    CREATE POLICY "Users can create their own window covering options" 
      ON public.window_covering_options 
      FOR INSERT 
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_covering_options' 
    AND policyname = 'Users can update their own window covering options'
  ) THEN
    CREATE POLICY "Users can update their own window covering options" 
      ON public.window_covering_options 
      FOR UPDATE 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'window_covering_options' 
    AND policyname = 'Users can delete their own window covering options'
  ) THEN
    CREATE POLICY "Users can delete their own window covering options" 
      ON public.window_covering_options 
      FOR DELETE 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_window_covering_option_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_window_covering_option_categories_updated_at 
      BEFORE UPDATE ON public.window_covering_option_categories 
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_window_covering_option_subcategories_updated_at'
  ) THEN
    CREATE TRIGGER update_window_covering_option_subcategories_updated_at 
      BEFORE UPDATE ON public.window_covering_option_subcategories 
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;
