-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('Owner', 'Admin', 'Manager', 'Staff', 'User');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('Owner', 'Admin')
  )
$$;

-- RLS policy for user_roles - users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin_or_owner());

-- RLS policy for user_roles - only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (is_admin_or_owner())
WITH CHECK (is_admin_or_owner());

-- Add profit margin settings to business_settings
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS show_profit_margins_to_staff BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_profit_margin_percentage NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS minimum_profit_margin_percentage NUMERIC DEFAULT 20;

-- Migrate existing roles from user_profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.user_profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Add columns to track pricing metadata in enhanced_inventory_items
ALTER TABLE public.enhanced_inventory_items
ADD COLUMN IF NOT EXISTS last_cost_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profit_margin_percentage NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN selling_price > 0 AND cost_price IS NOT NULL THEN 
      ((selling_price - cost_price) / selling_price * 100)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS markup_percentage_calculated NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN cost_price > 0 THEN 
      ((selling_price - cost_price) / cost_price * 100)
    ELSE 0
  END
) STORED;