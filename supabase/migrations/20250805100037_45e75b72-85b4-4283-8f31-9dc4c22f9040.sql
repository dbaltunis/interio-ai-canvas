-- Fix infinite recursion in workspace_members policies
-- Drop existing problematic policies and recreate them properly

-- Drop all existing policies for workspace_members
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and members can remove themselves" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can update members" ON workspace_members;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own membership" 
ON workspace_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view members of workspaces they own" 
ON workspace_members 
FOR SELECT 
USING (workspace_id IN (
  SELECT id FROM team_workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can add members" 
ON workspace_members 
FOR INSERT 
WITH CHECK (workspace_id IN (
  SELECT id FROM team_workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can update members" 
ON workspace_members 
FOR UPDATE 
USING (workspace_id IN (
  SELECT id FROM team_workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can remove members" 
ON workspace_members 
FOR DELETE 
USING (workspace_id IN (
  SELECT id FROM team_workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can remove themselves" 
ON workspace_members 
FOR DELETE 
USING (auth.uid() = user_id);