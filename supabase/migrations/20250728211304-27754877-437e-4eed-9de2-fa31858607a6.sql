-- Enable real-time functionality for emails and email_analytics tables
ALTER TABLE public.emails REPLICA IDENTITY FULL;
ALTER TABLE public.email_analytics REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_analytics;