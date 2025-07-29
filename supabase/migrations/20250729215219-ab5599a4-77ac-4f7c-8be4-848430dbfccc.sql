-- Create helper function to get user email (for edge functions)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;