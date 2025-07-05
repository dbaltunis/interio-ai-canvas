-- Enable realtime for emails table to improve tracking updates
ALTER TABLE public.emails REPLICA IDENTITY FULL;

-- Add the emails table to realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.emails;

-- Create an index to improve email status queries
CREATE INDEX IF NOT EXISTS idx_emails_status_user ON public.emails(user_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_opens_user ON public.emails(user_id, open_count) WHERE open_count > 0;