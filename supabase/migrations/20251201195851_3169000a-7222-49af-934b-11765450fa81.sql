-- Optimize get_team_presence to avoid N+1 queries by using JOIN instead of per-row function calls
CREATE OR REPLACE FUNCTION public.get_team_presence(search_param text DEFAULT NULL::text)
 RETURNS TABLE(user_id uuid, display_name text, role text, last_seen timestamp with time zone, is_online boolean, status text, status_message text, avatar_url text, theme_preference text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH current_user_account AS (
    -- Get the current user's account owner once
    SELECT COALESCE(parent_account_id, auth.uid()) as owner_id
    FROM public.user_profiles
    WHERE user_id = auth.uid()
  )
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
    END AS status,
    up.status_message,
    up.avatar_url,
    COALESCE(up.theme_preference, 'light') AS theme_preference
  FROM public.user_profiles up
  INNER JOIN current_user_account cua ON (
    -- Match users who share the same account owner
    COALESCE(up.parent_account_id, up.user_id) = cua.owner_id
  )
  WHERE (search_param IS NULL OR up.display_name ILIKE '%' || search_param || '%');
$function$;

-- Add index on parent_account_id for faster JOIN if not exists
CREATE INDEX IF NOT EXISTS idx_user_profiles_parent_account_id ON public.user_profiles(parent_account_id);

-- Add index on audit_log created_at for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);