-- Fix quotes and projects RLS policies that also reference workspace_members
-- These are causing similar recursive issues

-- Update quotes policies to remove workspace_members references
DROP POLICY IF EXISTS "Users can view team quotes" ON quotes;

CREATE POLICY "Users can view their own quotes" 
ON quotes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update projects policies to remove workspace_members references  
DROP POLICY IF EXISTS "Users can view team projects" ON projects;

CREATE POLICY "Users can view their own projects" 
ON projects 
FOR SELECT 
USING (auth.uid() = user_id);