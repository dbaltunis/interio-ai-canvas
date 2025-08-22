-- Fix RLS policies for treatments table to ensure proper data visibility

-- First, let's check what policies exist and drop them
DROP POLICY IF EXISTS "Users can view account treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can view treatments" ON public.treatments;

-- Create comprehensive RLS policies for the treatments table
CREATE POLICY "Users can view all account treatments" 
ON public.treatments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    get_account_owner(auth.uid()) = get_account_owner(user_id) OR 
    is_admin()
  )
);

CREATE POLICY "Users can create treatments" 
ON public.treatments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR is_admin()
);

CREATE POLICY "Users can update treatments" 
ON public.treatments 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  get_account_owner(auth.uid()) = get_account_owner(user_id) OR 
  is_admin()
);

CREATE POLICY "Users can delete treatments" 
ON public.treatments 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  get_account_owner(auth.uid()) = get_account_owner(user_id) OR 
  is_admin()
);