-- Fix job deletion by adding permission check to quotes DELETE policy

-- Drop the existing delete policy
DROP POLICY IF EXISTS "Users can delete quotes" ON public.quotes;

-- Create new delete policy that checks for delete_jobs permission
CREATE POLICY "Users can delete quotes" ON public.quotes
  FOR DELETE USING (
    (auth.uid() = user_id) OR 
    is_admin() OR
    (get_account_owner(auth.uid()) = get_account_owner(user_id) AND has_permission('delete_jobs'))
  );