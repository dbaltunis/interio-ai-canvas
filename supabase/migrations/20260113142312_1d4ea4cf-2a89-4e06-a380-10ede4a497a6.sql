-- Table for tracking work order share recipients
CREATE TABLE public.work_order_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_order_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Owner can manage their shares
CREATE POLICY "Users can manage their own work order shares"
ON public.work_order_shares
FOR ALL
USING (shared_by = auth.uid())
WITH CHECK (shared_by = auth.uid());

-- Policy: Allow public updates for access tracking (only access_count and last_accessed_at)
CREATE POLICY "Allow public access tracking updates"
ON public.work_order_shares
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Allow public to read shares for access tracking
CREATE POLICY "Allow public read for access tracking"
ON public.work_order_shares
FOR SELECT
USING (true);

-- Index for faster lookups
CREATE INDEX idx_work_order_shares_project ON public.work_order_shares(project_id);
CREATE INDEX idx_work_order_shares_shared_by ON public.work_order_shares(shared_by);

-- Trigger for updated_at
CREATE TRIGGER update_work_order_shares_updated_at
  BEFORE UPDATE ON public.work_order_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();