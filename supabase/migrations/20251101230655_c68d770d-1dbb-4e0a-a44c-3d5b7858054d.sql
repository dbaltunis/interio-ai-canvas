
-- Phase 2: Settings Inheritance Fix
-- Add RLS policies to allow child accounts to view parent settings

-- 1. User Preferences Inheritance
DROP POLICY IF EXISTS "Child users can view parent preferences" ON public.user_preferences;
CREATE POLICY "Child users can view parent preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.get_account_owner(auth.uid()) = user_id
);

-- 2. Curtain Templates Inheritance
DROP POLICY IF EXISTS "Child users can view parent templates" ON public.curtain_templates;
CREATE POLICY "Child users can view parent templates"
ON public.curtain_templates
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.get_account_owner(auth.uid()) = user_id
  OR is_system_default = true
);

-- 3. Enhanced Inventory Inheritance
DROP POLICY IF EXISTS "Child users can view parent inventory" ON public.enhanced_inventory_items;
CREATE POLICY "Child users can view parent inventory"
ON public.enhanced_inventory_items
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.get_account_owner(auth.uid()) = user_id
);
