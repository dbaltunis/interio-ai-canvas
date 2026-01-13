-- Optimize workshop_items RLS for performance
-- The current approach causes statement timeouts due to double function calls

-- Step 1: Add index to speed up user_profiles lookup if not exists
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_parent_account_id ON user_profiles(parent_account_id);

-- Step 2: Add index on workshop_items.user_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_workshop_items_user_id ON workshop_items(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_items_project_id ON workshop_items(project_id);

-- Step 3: Create a more performant SECURITY DEFINER function that caches the current user's account owner
CREATE OR REPLACE FUNCTION public.current_user_account_owner()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(parent_account_id, user_id)
  FROM user_profiles
  WHERE user_id = auth.uid()
$$;

-- Step 4: Drop old policies
DROP POLICY IF EXISTS "Account isolation - workshop_items SELECT" ON workshop_items;
DROP POLICY IF EXISTS "Account isolation - workshop_items UPDATE" ON workshop_items;
DROP POLICY IF EXISTS "Account isolation - workshop_items DELETE" ON workshop_items;

-- Step 5: Create optimized policies - only call get_effective_account_owner once for row.user_id
-- Current user's account owner is computed once via the function
CREATE POLICY "Account scoped - workshop_items SELECT" 
ON workshop_items FOR SELECT 
USING (
  get_effective_account_owner(user_id) = current_user_account_owner()
);

CREATE POLICY "Account scoped - workshop_items UPDATE" 
ON workshop_items FOR UPDATE 
USING (
  get_effective_account_owner(user_id) = current_user_account_owner()
);

CREATE POLICY "Account scoped - workshop_items DELETE" 
ON workshop_items FOR DELETE 
USING (
  get_effective_account_owner(user_id) = current_user_account_owner()
);