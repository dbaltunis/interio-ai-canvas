-- Add theme_preference column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN theme_preference text DEFAULT 'light';

-- Drop existing function and recreate with theme preference
DROP FUNCTION public.get_team_presence(text);

CREATE OR REPLACE FUNCTION public.get_team_presence(search_param text DEFAULT NULL::text)
 RETURNS TABLE(user_id uuid, display_name text, role text, last_seen timestamp with time zone, is_online boolean, status text, status_message text, avatar_url text, theme_preference text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE
    public.get_account_owner(up.user_id) = public.get_account_owner(auth.uid())
    AND (search_param IS NULL OR up.display_name ILIKE '%' || search_param || '%');
$function$