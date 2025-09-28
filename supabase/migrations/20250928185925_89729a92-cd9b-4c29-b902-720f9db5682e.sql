-- Fix the increment_email_open_count function to properly update and return data
CREATE OR REPLACE FUNCTION public.increment_email_open_count(email_id_param UUID)
RETURNS TABLE(id UUID, open_count INTEGER, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Perform the update and get the result
  UPDATE emails 
  SET 
    open_count = COALESCE(emails.open_count, 0) + 1,
    status = CASE 
      WHEN emails.status IN ('sent', 'delivered', 'processed') THEN 'opened'
      ELSE emails.status
    END,
    updated_at = now()
  WHERE emails.id = email_id_param
  RETURNING emails.id, emails.open_count, emails.status INTO result_record;
  
  -- Return the result
  id := result_record.id;
  open_count := result_record.open_count;
  status := result_record.status;
  
  RETURN NEXT;
END;
$$;