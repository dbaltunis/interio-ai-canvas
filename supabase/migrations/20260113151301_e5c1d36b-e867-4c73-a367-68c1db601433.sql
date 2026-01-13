-- Fix: Update workshop_items RLS policies to be account-scoped
-- This allows account owners/admins to see workshop items created by team members

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view their workshop items" ON workshop_items;
DROP POLICY IF EXISTS "Users can update their workshop items" ON workshop_items;
DROP POLICY IF EXISTS "Users can delete their workshop items" ON workshop_items;

-- Create account-scoped policies using get_effective_account_owner
CREATE POLICY "Account isolation - workshop_items SELECT" 
ON workshop_items FOR SELECT 
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
);

CREATE POLICY "Account isolation - workshop_items UPDATE" 
ON workshop_items FOR UPDATE 
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
);

CREATE POLICY "Account isolation - workshop_items DELETE" 
ON workshop_items FOR DELETE 
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
);