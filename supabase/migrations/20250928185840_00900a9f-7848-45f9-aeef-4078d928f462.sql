-- Fix the increment_email_open_count function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.increment_email_open_count(email_id_param UUID)
RETURNS TABLE(id UUID, open_count INTEGER, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE emails 
  SET 
    open_count = COALESCE(emails.open_count, 0) + 1,
    status = CASE 
      WHEN emails.status IN ('sent', 'delivered', 'processed') THEN 'opened'
      ELSE emails.status
    END,
    updated_at = now()
  WHERE emails.id = email_id_param
  RETURNING emails.id, emails.open_count, emails.status;
END;
$$;