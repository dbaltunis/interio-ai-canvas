-- Create calendar sharing tables for collaboration features

-- Table for sharing calendars between users
CREATE TABLE public.calendar_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  shared_with_user_id UUID NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, shared_with_user_id)
);

-- Table for sharing appointments between users
CREATE TABLE public.appointment_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  shared_with_user_id UUID NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id, shared_with_user_id)
);

-- Table for team workspaces
CREATE TABLE public.team_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for workspace members
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.calendar_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_shares
CREATE POLICY "Users can view calendars shared with them" 
ON public.calendar_shares 
FOR SELECT 
USING (auth.uid() = shared_with_user_id OR auth.uid() = owner_id);

CREATE POLICY "Calendar owners can create shares" 
ON public.calendar_shares 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Calendar owners can update shares" 
ON public.calendar_shares 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Calendar owners can delete shares" 
ON public.calendar_shares 
FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for appointment_shares
CREATE POLICY "Users can view appointments shared with them" 
ON public.appointment_shares 
FOR SELECT 
USING (auth.uid() = shared_with_user_id OR auth.uid() = owner_id);

CREATE POLICY "Appointment owners can create shares" 
ON public.appointment_shares 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Appointment owners can update shares" 
ON public.appointment_shares 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Appointment owners can delete shares" 
ON public.appointment_shares 
FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for team_workspaces
CREATE POLICY "Users can view their own workspaces" 
ON public.team_workspaces 
FOR SELECT 
USING (auth.uid() = owner_id OR auth.uid() IN (
  SELECT user_id FROM workspace_members WHERE workspace_id = id
));

CREATE POLICY "Users can create their own workspaces" 
ON public.team_workspaces 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update their workspaces" 
ON public.team_workspaces 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces" 
ON public.team_workspaces 
FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for workspace_members
CREATE POLICY "Users can view workspace members" 
ON public.workspace_members 
FOR SELECT 
USING (auth.uid() IN (
  SELECT owner_id FROM team_workspaces WHERE id = workspace_id
) OR auth.uid() = user_id);

CREATE POLICY "Workspace owners can add members" 
ON public.workspace_members 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT owner_id FROM team_workspaces WHERE id = workspace_id
));

CREATE POLICY "Workspace owners can update members" 
ON public.workspace_members 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT owner_id FROM team_workspaces WHERE id = workspace_id
));

CREATE POLICY "Workspace owners and members can remove themselves" 
ON public.workspace_members 
FOR DELETE 
USING (auth.uid() IN (
  SELECT owner_id FROM team_workspaces WHERE id = workspace_id
) OR auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_calendar_shares_calendar_id ON public.calendar_shares(calendar_id);
CREATE INDEX idx_calendar_shares_shared_with ON public.calendar_shares(shared_with_user_id);
CREATE INDEX idx_appointment_shares_appointment_id ON public.appointment_shares(appointment_id);
CREATE INDEX idx_appointment_shares_shared_with ON public.appointment_shares(shared_with_user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_calendar_shares_updated_at
  BEFORE UPDATE ON public.calendar_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_shares_updated_at
  BEFORE UPDATE ON public.appointment_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_workspaces_updated_at
  BEFORE UPDATE ON public.team_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();