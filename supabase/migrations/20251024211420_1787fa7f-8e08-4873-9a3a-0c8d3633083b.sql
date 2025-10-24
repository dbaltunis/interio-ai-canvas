-- Fix Google Calendar auto-sync: Update trigger function with better error handling
CREATE OR REPLACE FUNCTION public.trigger_sync_to_google()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  service_key text;
BEGIN
  -- Get the service role key
  service_key := current_setting('app.settings.service_role_key', true);
  
  IF service_key IS NULL OR service_key = '' THEN
    RAISE WARNING 'Service role key not configured for Google Calendar sync';
    RETURN NEW;
  END IF;
  
  RAISE LOG 'Triggering sync to Google Calendar for appointment %', NEW.id;
  
  -- Call the edge function
  SELECT net.http_post(
    url := 'https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sync-to-google-calendar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('appointmentId', NEW.id::text)
  ) INTO request_id;
  
  RAISE LOG 'Sync request initiated with ID: %', request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error triggering sync to Google: %', SQLERRM;
  RETURN NEW;
END;
$$;