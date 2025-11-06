-- Fix three critical user management and settings inheritance issues

-- =============================================
-- ISSUE 1: FIX USER ROLES - ONE ROLE PER USER
-- =============================================

-- Clean up users with multiple roles (keep highest privilege)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id
    FROM public.user_roles
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) dups;

  IF duplicate_count > 0 THEN
    -- Delete lower priority roles for users with multiple roles
    DELETE FROM public.user_roles
    WHERE id IN (
      SELECT ur.id
      FROM public.user_roles ur
      INNER JOIN (
        SELECT 
          user_id,
          MIN(
            CASE role
              WHEN 'Owner' THEN 1
              WHEN 'Admin' THEN 2
              WHEN 'Manager' THEN 3
              WHEN 'Staff' THEN 4
              WHEN 'User' THEN 5
            END
          ) as min_rank
        FROM public.user_roles
        GROUP BY user_id
        HAVING COUNT(*) > 1
      ) ranked ON ur.user_id = ranked.user_id
      WHERE CASE ur.role
              WHEN 'Owner' THEN 1
              WHEN 'Admin' THEN 2
              WHEN 'Manager' THEN 3
              WHEN 'Staff' THEN 4
              WHEN 'User' THEN 5
            END > ranked.min_rank
    );
    
    RAISE NOTICE 'Cleaned up % users with duplicate roles', duplicate_count;
  END IF;
END $$;

-- Drop old constraint and add new one
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Update triggers
CREATE OR REPLACE FUNCTION sync_profile_role_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET role = NEW.role::text
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    expected_perms text[];
    perm_to_add text;
BEGIN
    expected_perms := public.get_default_permissions_for_role(NEW.role);
    
    IF expected_perms IS NOT NULL THEN
        FOREACH perm_to_add IN ARRAY expected_perms LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (NEW.user_id, perm_to_add, NEW.parent_account_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
        END LOOP;
    END IF;
    
    -- UPSERT role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role::app_role)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role;
    
    RETURN NEW;
END;
$$;

-- =============================================
-- ISSUE 2: FIX BUSINESS SETTINGS INHERITANCE
-- =============================================

DROP POLICY IF EXISTS "Users can view their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can create their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Users can update their own business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Account members can view business settings" ON public.business_settings;

CREATE POLICY "Account members can view business settings" 
ON public.business_settings 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  get_account_owner(auth.uid()) = user_id
);

CREATE POLICY "Users can create their own business settings" 
ON public.business_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings" 
ON public.business_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- =============================================
-- ISSUE 3: FIX INTEGRATION SETTINGS INHERITANCE
-- =============================================

-- Populate account_owner_id
UPDATE public.integration_settings 
SET account_owner_id = get_account_owner(user_id)
WHERE account_owner_id IS NULL;

-- Drop ALL existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'integration_settings' 
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.integration_settings', pol.policyname);
  END LOOP;
END $$;

-- Create new policies
CREATE POLICY "Account members can view integration settings" 
ON public.integration_settings 
FOR SELECT 
USING (get_account_owner(auth.uid()) = account_owner_id);

CREATE POLICY "Account owners can create integration settings" 
ON public.integration_settings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND get_account_owner(auth.uid()) = account_owner_id
);

CREATE POLICY "Account owners can update integration settings" 
ON public.integration_settings 
FOR UPDATE 
USING (
  get_account_owner(auth.uid()) = account_owner_id
  AND (auth.uid() = user_id OR get_account_owner(auth.uid()) = auth.uid())
);

CREATE POLICY "Account owners can delete integration settings" 
ON public.integration_settings 
FOR DELETE 
USING (
  get_account_owner(auth.uid()) = account_owner_id
  AND (auth.uid() = user_id OR get_account_owner(auth.uid()) = auth.uid())
);