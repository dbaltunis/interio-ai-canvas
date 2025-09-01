-- Create push queue table for Google Sheets sync
CREATE TABLE public.crm_push_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id uuid NOT NULL,
  attempt integer DEFAULT 0,
  next_run_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  error_message text,
  status text CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending'
);

-- Enable RLS on crm_push_queue
ALTER TABLE public.crm_push_queue ENABLE ROW LEVEL SECURITY;

-- RLS policy for crm_push_queue
CREATE POLICY "Account owners can manage push queue"
ON public.crm_push_queue
FOR ALL
USING (
  get_account_owner(auth.uid()) IS NOT NULL OR is_admin()
);

-- Create index for efficient queue processing
CREATE INDEX idx_crm_push_queue_next_run ON public.crm_push_queue(next_run_at, status) 
WHERE status IN ('pending', 'processing');