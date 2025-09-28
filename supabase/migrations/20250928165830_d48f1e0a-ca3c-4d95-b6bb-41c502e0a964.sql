-- Create atomic function to increment email open count to prevent race conditions
CREATE OR REPLACE FUNCTION increment_email_open_count(email_id_param UUID)
RETURNS TABLE (
  id UUID,
  open_count INTEGER,
  status TEXT
) AS $$
DECLARE
  current_status TEXT;
  new_open_count INTEGER;
BEGIN
  -- Get current email data
  SELECT emails.status INTO current_status 
  FROM emails 
  WHERE emails.id = email_id_param;
  
  -- Atomically increment open count and update status if needed
  UPDATE emails 
  SET 
    open_count = COALESCE(open_count, 0) + 1,
    status = CASE 
      WHEN emails.status IN ('sent', 'delivered', 'processed') THEN 'opened'
      ELSE emails.status
    END,
    updated_at = now()
  WHERE emails.id = email_id_param
  RETURNING emails.id, emails.open_count, emails.status INTO id, new_open_count, status;
  
  -- Return the updated values
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;