-- Update RLS policy to allow users with manage_users permission to update other profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can update profiles with permission" 
ON user_profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR public.has_permission('manage_users')
);