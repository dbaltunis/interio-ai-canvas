-- Update RLS policies to enable team collaboration for quotes
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;

CREATE POLICY "Users can view team quotes"
ON quotes
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  user_id IN (
    SELECT wm.user_id 
    FROM workspace_members wm
    INNER JOIN workspace_members current_user_workspaces 
      ON wm.workspace_id = current_user_workspaces.workspace_id
    WHERE current_user_workspaces.user_id = auth.uid()
  )
  OR
  user_id IN (
    SELECT tw.owner_id 
    FROM team_workspaces tw
    INNER JOIN workspace_members wm 
      ON tw.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Update RLS policies for projects to enable team collaboration
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;

CREATE POLICY "Users can view team projects"
ON projects
FOR SELECT  
TO authenticated
USING (
  auth.uid() = user_id
  OR 
  user_id IN (
    SELECT wm.user_id 
    FROM workspace_members wm
    INNER JOIN workspace_members current_user_workspaces 
      ON wm.workspace_id = current_user_workspaces.workspace_id
    WHERE current_user_workspaces.user_id = auth.uid()
  )
  OR
  user_id IN (
    SELECT tw.owner_id 
    FROM team_workspaces tw
    INNER JOIN workspace_members wm 
      ON tw.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Update RLS policies for clients to enable team collaboration
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;

CREATE POLICY "Users can view team clients"
ON clients
FOR SELECT
TO authenticated  
USING (
  auth.uid() = user_id
  OR 
  user_id IN (
    SELECT wm.user_id 
    FROM workspace_members wm
    INNER JOIN workspace_members current_user_workspaces 
      ON wm.workspace_id = current_user_workspaces.workspace_id
    WHERE current_user_workspaces.user_id = auth.uid()
  )
  OR
  user_id IN (
    SELECT tw.owner_id 
    FROM team_workspaces tw
    INNER JOIN workspace_members wm 
      ON tw.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);