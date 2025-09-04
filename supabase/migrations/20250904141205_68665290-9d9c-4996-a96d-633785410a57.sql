-- Fix RLS policies for window_types to work without orgs table
-- and use get_account_owner function that already exists

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view org window types" ON public.window_types;
DROP POLICY IF EXISTS "Users can manage org window types" ON public.window_types;

-- Create new policies that work with the existing user system
CREATE POLICY "Users can view their window types" ON public.window_types
  FOR SELECT USING (org_id = get_account_owner(auth.uid()));

CREATE POLICY "Users can manage their window types" ON public.window_types
  FOR ALL USING (org_id = get_account_owner(auth.uid()));