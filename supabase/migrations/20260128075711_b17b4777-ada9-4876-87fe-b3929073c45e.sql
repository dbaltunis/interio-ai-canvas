-- Create status_change_history table for audit trail
CREATE TABLE public.status_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_status_id UUID REFERENCES public.job_statuses(id) ON DELETE SET NULL,
  new_status_id UUID REFERENCES public.job_statuses(id) ON DELETE SET NULL,
  previous_status_name TEXT,
  new_status_name TEXT,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  notes TEXT,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_status_history_project ON status_change_history(project_id);
CREATE INDEX idx_status_history_time ON status_change_history(changed_at DESC);
CREATE INDEX idx_status_history_user ON status_change_history(changed_by);

-- Enable RLS
ALTER TABLE status_change_history ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can view history for projects they have access to
CREATE POLICY "status_history_select" ON status_change_history
FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
  )
);

-- Insert policy: Users can log status changes
CREATE POLICY "status_history_insert" ON status_change_history
FOR INSERT WITH CHECK (
  changed_by = auth.uid()
);

-- Update existing statuses: convert deprecated action types to simplified ones
UPDATE job_statuses 
SET action = 'locked' 
WHERE action IN ('view_only', 'completed', 'progress_only');

-- Add comment explaining the simplified status system
COMMENT ON TABLE status_change_history IS 'Audit trail for all project status changes. Records who changed what, when, and why (for requires_reason actions).';