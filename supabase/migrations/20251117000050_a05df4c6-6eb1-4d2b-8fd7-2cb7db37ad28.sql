-- Fix RLS for user_profiles and enhanced_inventory_items
-- These tables still had old policies using get_account_owner() instead of get_effective_account_owner()

-- Drop all old policies on user_profiles
DROP POLICY IF EXISTS "Account owners can manage all users in their account" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their account context" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view team profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view users in their account" ON public.user_profiles;
DROP POLICY IF EXISTS "read user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update account types" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update profiles with permission" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own last seen" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their profile with role validation" ON public.user_profiles;

-- Drop all old policies on enhanced_inventory_items
DROP POLICY IF EXISTS "Users can manage inventory based on permissions" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Child users can view parent inventory" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can view account inventory and defaults" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "Users can view inventory based on permissions" ON public.enhanced_inventory_items;
DROP POLICY IF EXISTS "read enhanced_inventory_items" ON public.enhanced_inventory_items;

-- Create new secure policies for user_profiles
CREATE POLICY "Account isolation - SELECT" ON public.user_profiles
  FOR SELECT
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - INSERT" ON public.user_profiles
  FOR INSERT
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - UPDATE" ON public.user_profiles
  FOR UPDATE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - DELETE" ON public.user_profiles
  FOR DELETE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

-- Create new secure policies for enhanced_inventory_items
CREATE POLICY "Account isolation - SELECT" ON public.enhanced_inventory_items
  FOR SELECT
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - INSERT" ON public.enhanced_inventory_items
  FOR INSERT
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - UPDATE" ON public.enhanced_inventory_items
  FOR UPDATE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - DELETE" ON public.enhanced_inventory_items
  FOR DELETE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );