
-- 1) Migrate any leftover profiles to user_profiles (safe if table exists and there are rows)
INSERT INTO public.user_profiles (user_id, display_name, is_active, created_at, updated_at)
SELECT p.id,
       COALESCE(p.email, 'User ' || substr(p.id::text, 1, 8)),
       true,
       now(),
       now()
FROM public.profiles p
LEFT JOIN public.user_profiles up ON up.user_id = p.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2) Refactor the trigger function so new signups upsert into user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    role,
    is_active,
    has_logged_in,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.email
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Owner'),
    true,
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    -- only fill display_name if it's currently NULL; otherwise keep existing
    display_name = COALESCE(public.user_profiles.display_name, EXCLUDED.display_name),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 3) Remove the old helper function if it exists (it wrote into public.profiles)
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- 4) Drop the obsolete profiles table (policies and triggers on it are dropped automatically)
DROP TABLE IF EXISTS public.profiles;
