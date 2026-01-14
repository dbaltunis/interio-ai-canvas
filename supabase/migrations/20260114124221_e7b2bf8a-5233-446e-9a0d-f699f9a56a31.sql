-- Add viewer session tracking columns to work_order_shares
ALTER TABLE public.work_order_shares
ADD COLUMN IF NOT EXISTS session_token text UNIQUE,
ADD COLUMN IF NOT EXISTS created_by_viewer boolean DEFAULT false;

-- Create index for session token lookups
CREATE INDEX IF NOT EXISTS idx_work_order_shares_session 
ON public.work_order_shares(session_token) WHERE session_token IS NOT NULL;

-- Allow anonymous users to insert viewer sessions
CREATE POLICY "Allow anonymous viewers to create their own session"
ON public.work_order_shares
FOR INSERT
TO anon
WITH CHECK (created_by_viewer = true);

-- Allow anonymous users to update their own session (for access tracking)
CREATE POLICY "Allow anonymous viewers to update their own session"
ON public.work_order_shares
FOR UPDATE
TO anon
USING (session_token IS NOT NULL AND created_by_viewer = true);

-- Allow anonymous users to select their own session by token
CREATE POLICY "Allow anonymous viewers to read their own session"
ON public.work_order_shares
FOR SELECT
TO anon
USING (session_token IS NOT NULL);