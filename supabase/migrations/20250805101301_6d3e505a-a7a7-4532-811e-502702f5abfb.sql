-- Clean up unused workspace tables to prevent future issues
-- These tables were causing the RLS problems and are no longer needed

-- Drop the problematic workspace tables
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.team_workspaces CASCADE;
DROP TABLE IF EXISTS public.calendar_shares CASCADE;

-- Remove any remaining references to workspace functionality
-- Note: This will prevent future confusion and recursive RLS issues