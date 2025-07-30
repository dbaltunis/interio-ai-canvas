-- Create missing user profile for existing users
INSERT INTO public.user_profiles (user_id, display_name)
SELECT 
  id, 
  COALESCE(raw_user_meta_data ->> 'full_name', email)
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_profiles);