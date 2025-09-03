-- Create the get_notification_usage function that returns notification usage for a user in a given period
CREATE OR REPLACE FUNCTION public.get_notification_usage(user_id_param uuid, period_start_param timestamp with time zone)
RETURNS TABLE(
  email_count integer,
  sms_count integer,
  period_start text,
  period_end text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  period_end_date timestamp with time zone;
  usage_record record;
BEGIN
  -- Calculate period end (last day of month)
  period_end_date := (date_trunc('month', period_start_param) + interval '1 month - 1 day')::timestamp with time zone;
  
  -- Try to get existing usage record
  SELECT nu.email_count, nu.sms_count INTO usage_record
  FROM notification_usage nu
  WHERE nu.user_id = user_id_param 
    AND nu.period_start >= period_start_param::date
    AND nu.period_start < (period_start_param + interval '1 month')::date
  LIMIT 1;
  
  -- Return usage data or defaults if no record exists
  RETURN QUERY SELECT 
    COALESCE(usage_record.email_count, 0) as email_count,
    COALESCE(usage_record.sms_count, 0) as sms_count,
    period_start_param::text as period_start,
    period_end_date::text as period_end;
END;
$$;