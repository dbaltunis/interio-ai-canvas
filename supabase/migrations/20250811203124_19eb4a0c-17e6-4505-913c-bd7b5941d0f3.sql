-- Secure user presence and provide sanitized access via RPC

-- 1) Conditionally lock down a standalone user_presence table if it exists
DO $$
BEGIN
  IF to_regclass('public.user_presence') IS NOT NULL THEN
    -- Enable RLS if not already enabled
    EXECUTE 'ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY';

    -- Drop overly permissive policies if any (ignore if not present)
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public can view presence" ON public.user_presence';
      EXECUTE 'DROP POLICY IF EXISTS "Anyone can select user_presence" ON public.user_presence';
    EXCEPTION WHEN others THEN
      -- ignore
    END;

    -- Restrict reads to users within the same account
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Team can view presence"
      ON public.user_presence
      FOR SELECT
      USING (
        public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
      )
    $$;

    -- Allow users to manage their own presence; admins can manage all via is_admin()
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Users manage own presence"
      ON public.user_presence
      FOR ALL
      USING (auth.uid() = user_id OR public.is_admin())
      WITH CHECK (auth.uid() = user_id OR public.is_admin())
    $$;
  END IF;
END$$;

-- 2) Create a sanitized RPC to fetch team presence from user_profiles
CREATE OR REPLACE FUNCTION public.get_team_presence(search_param text DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role text,
  last_seen timestamptz,
  is_online boolean,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    up.user_id,
    COALESCE(up.display_name, 'User') AS display_name,
    COALESCE(up.role, 'User') AS role,
    up.last_seen,
    COALESCE(up.is_online, false) AS is_online,
    CASE
      WHEN COALESCE(up.is_online, false) = true THEN 'online'
      WHEN up.last_seen IS NULL THEN 'never_logged_in'
      WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
      ELSE 'away'
    END AS status
  FROM public.user_profiles up
  WHERE
    -- Only users within same account owner are visible
    public.get_account_owner(up.user_id) = public.get_account_owner(auth.uid())
    AND (search_param IS NULL OR up.display_name ILIKE '%' || search_param || '%');
$$;

REVOKE ALL ON FUNCTION public.get_team_presence(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_team_presence(text) TO authenticated;

-- 3) Optional: Replace any existing presence view with a sanitized one (no security definer)
--    This avoids accidental public exposure via views.
DROP VIEW IF EXISTS public.user_presence_view;
CREATE VIEW public.user_presence_view AS
SELECT 
  up.user_id,
  COALESCE(up.display_name, 'User') AS display_name,
  COALESCE(up.role, 'User') AS role,
  up.last_seen,
  COALESCE(up.is_online, false) AS is_online,
  CASE
    WHEN COALESCE(up.is_online, false) = true THEN 'online'
    WHEN up.last_seen IS NULL THEN 'never_logged_in'
    WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
    ELSE 'away'
  END AS status
FROM public.user_profiles up
WHERE up.is_active IS DISTINCT FROM false;