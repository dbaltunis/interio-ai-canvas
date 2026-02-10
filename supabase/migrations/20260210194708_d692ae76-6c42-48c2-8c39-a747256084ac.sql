
-- Create calendar_team_groups table
CREATE TABLE public.calendar_team_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_team_groups ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS policy
CREATE POLICY "Users can manage their team groups"
  ON public.calendar_team_groups FOR ALL TO authenticated
  USING (user_id = public.get_effective_account_owner(auth.uid()))
  WITH CHECK (user_id = public.get_effective_account_owner(auth.uid()));

-- Add calendar_group_id to appointments
ALTER TABLE public.appointments
  ADD COLUMN calendar_group_id UUID REFERENCES public.calendar_team_groups(id) ON DELETE SET NULL;

-- Timestamp trigger for calendar_team_groups
CREATE TRIGGER update_calendar_team_groups_updated_at
  BEFORE UPDATE ON public.calendar_team_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
