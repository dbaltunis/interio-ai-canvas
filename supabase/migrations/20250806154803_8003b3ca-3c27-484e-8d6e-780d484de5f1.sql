-- Add first_name and last_name to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;