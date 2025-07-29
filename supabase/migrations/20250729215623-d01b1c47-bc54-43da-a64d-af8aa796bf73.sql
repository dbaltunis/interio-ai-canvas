-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the notification processor to run every minute
SELECT cron.schedule(
  'process-appointment-notifications',
  '* * * * *', -- Run every minute
  $$
  SELECT
    net.http_post(
        url := 'https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/process-notifications',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3Jjb2RmZnNhbGtldmFmYmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTAyMDEsImV4cCI6MjA2NjI2NjIwMX0.d9jbWQB2byOUGPkBp7lLjqE1tKkR4KtDcgaTiU42r_I"}'::jsonb,
        body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);