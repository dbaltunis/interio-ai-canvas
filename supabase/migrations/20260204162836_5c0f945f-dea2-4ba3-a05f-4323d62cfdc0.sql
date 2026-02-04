-- ============================================================
-- Step 2: Repair missing user_profiles (trigger is now safe)
-- ============================================================

-- Repair missing user_profiles for OWNERS ONLY (users without parent_account_id)
INSERT INTO public.user_profiles (user_id, display_name, role, parent_account_id, is_active, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ),
  'Owner',
  NULL,
  true,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE up.user_id IS NULL
  AND (au.raw_user_meta_data->>'invited_by') IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Handle invited users who are missing profiles
INSERT INTO public.user_profiles (user_id, display_name, role, parent_account_id, is_active, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(au.raw_user_meta_data->>'role', 'Staff'),
  (au.raw_user_meta_data->>'invited_by')::uuid,
  true,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE up.user_id IS NULL
  AND (au.raw_user_meta_data->>'invited_by') IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Step 3: Fix the handle_new_user trigger to NOT silently fail
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name_val TEXT;
  company_val TEXT;
  default_role TEXT := 'Owner';
  is_invited BOOLEAN := FALSE;
  parent_id UUID := NULL;
BEGIN
  -- Extract display name
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  company_val := NEW.raw_user_meta_data->>'company_name';
  
  -- Check if this is an invited user
  IF NEW.raw_user_meta_data->>'invited_by' IS NOT NULL THEN
    is_invited := TRUE;
    default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Staff');
    parent_id := (NEW.raw_user_meta_data->>'invited_by')::uuid;
  END IF;

  -- CRITICAL: Create user profile first - this MUST succeed
  -- No exception handler here - if this fails, the whole registration fails
  -- This prevents orphaned auth users without profiles
  INSERT INTO public.user_profiles (
    user_id, 
    display_name, 
    role, 
    parent_account_id, 
    is_active, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    display_name_val,
    default_role,
    parent_id,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = now();

  -- Create user role (non-critical - can fail silently)
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, default_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Failed to create role for %: %', NEW.id, SQLERRM;
  END;

  -- Create business settings for new owners only (non-critical)
  IF NOT is_invited THEN
    BEGIN
      INSERT INTO public.business_settings (user_id, company_name, tax_type, tax_rate)
      VALUES (NEW.id, COALESCE(company_val, 'My Company'), 'GST', 10)
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Failed to create business_settings for %: %', NEW.id, SQLERRM;
    END;

    BEGIN
      INSERT INTO public.account_settings (account_owner_id, currency, language)
      VALUES (NEW.id, 'AUD', 'en')
      ON CONFLICT (account_owner_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Failed to create account_settings for %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;