-- Create project_assignments table for job delegation
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_project_assignments_project_id ON public.project_assignments(project_id);
CREATE INDEX idx_project_assignments_user_id ON public.project_assignments(user_id);
CREATE INDEX idx_project_assignments_active ON public.project_assignments(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Users can see assignments for projects they own or are assigned to
CREATE POLICY "project_assignments_select" ON public.project_assignments
FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
  OR user_id = auth.uid()
);

-- Only project owners can manage assignments
CREATE POLICY "project_assignments_insert" ON public.project_assignments
FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

CREATE POLICY "project_assignments_update" ON public.project_assignments
FOR UPDATE USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

CREATE POLICY "project_assignments_delete" ON public.project_assignments
FOR DELETE USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = public.get_effective_account_owner(auth.uid())
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_project_assignments_updated_at
BEFORE UPDATE ON public.project_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();