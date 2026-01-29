-- Create project_activity_log table for audit trail
CREATE TABLE public.project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_project_activity_project_id ON public.project_activity_log(project_id);
CREATE INDEX idx_project_activity_created_at ON public.project_activity_log(created_at DESC);
CREATE INDEX idx_project_activity_type ON public.project_activity_log(activity_type);

-- Enable RLS
ALTER TABLE public.project_activity_log ENABLE ROW LEVEL SECURITY;

-- Create helper function to check project access (avoid recursion)
CREATE OR REPLACE FUNCTION public.user_has_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM project_assignments 
    WHERE project_id = p_project_id AND user_id = p_user_id AND is_active = true
  )
$$;

-- RLS: Users can view activity for projects they own or are assigned to
CREATE POLICY "View project activities"
ON public.project_activity_log FOR SELECT
USING (public.user_has_project_access(project_id, auth.uid()));

-- RLS: Users can insert activity (user_id must match)
CREATE POLICY "Insert project activities"
ON public.project_activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);