
-- 1) Fast lookup for tokens
CREATE INDEX IF NOT EXISTS idx_user_invitations_token
  ON public.user_invitations (invitation_token);

-- 2) Secure function to validate invitation token for invitees (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invitation_token_param uuid)
RETURNS TABLE (
  invited_email text,
  invited_name text,
  role text,
  invited_by_name text,
  invited_by_email text,
  expires_at timestamptz,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT
    ui.invited_email,
    ui.invited_name,
    ui.role,
    ui.invited_by_name,
    ui.invited_by_email,
    ui.expires_at,
    ui.status
  FROM public.user_invitations ui
  WHERE ui.invitation_token = invitation_token_param
    AND ui.status = 'pending'
    AND ui.expires_at > now()
  LIMIT 1;
$function$;
