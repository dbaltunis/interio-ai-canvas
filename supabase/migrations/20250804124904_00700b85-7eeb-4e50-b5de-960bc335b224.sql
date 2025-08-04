-- Fix user_profiles table structure and foreign key
-- First, check current foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f' AND conrelid = 'public.user_profiles'::regclass;

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Make user_id the primary key since it should be unique
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_pkey;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);

-- Add foreign key reference to auth.users properly
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remove the redundant id column since user_id is now the primary key
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS id;