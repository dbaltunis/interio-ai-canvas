-- Fix get_invitation_by_token to return user_id (inviter's ID) and company_name
-- This is needed for the signup flow to pass invitation_user_id in metadata
-- and to display the company name in the UI
-- Also fix: Accept text input and cast to UUID internally for better compatibility

-- Drop existing function first to allow return type change
DROP FUNCTION IF EXISTS public.get_invitation_by_token(uuid);
DROP FUNCTION IF EXISTS public.get_invitation_by_token(text);

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invitation_token_param text)
RETURNS TABLE (
  invited_email text,
  invited_name text,
  role text,
  invited_by_name text,
  invited_by_email text,
  expires_at timestamptz,
  status text,
  user_id uuid,
  company_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  token_uuid uuid;
BEGIN
  -- Validate and convert token to UUID
  BEGIN
    token_uuid := invitation_token_param::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Invalid UUID format, return no rows
    RETURN;
  END;

  -- Query invitation with validated UUID
  RETURN QUERY
  SELECT
    ui.invited_email,
    ui.invited_name,
    ui.role,
    ui.invited_by_name,
    ui.invited_by_email,
    ui.expires_at,
    ui.status,
    ui.user_id,
    COALESCE(
      (SELECT bs.company_name 
       FROM public.business_settings bs 
       WHERE bs.user_id = ui.user_id 
       LIMIT 1),
      'the team'
    ) as company_name
  FROM public.user_invitations ui
  WHERE ui.invitation_token = token_uuid
    AND ui.status = 'pending'
    AND ui.expires_at > now()
  LIMIT 1;
END;
$function$;

