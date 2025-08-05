-- Fix clients RLS policy to remove workspace_members references
-- This should resolve the client section not being visible

-- Drop any existing team-based policies on clients
DROP POLICY IF EXISTS "Users can view team clients" ON clients;
DROP POLICY IF EXISTS "Users can view workspace clients" ON clients;

-- Create simple user-based policy for clients (matching quotes and projects)
CREATE POLICY "Users can view their own clients" 
ON clients 
FOR SELECT 
USING (auth.uid() = user_id);