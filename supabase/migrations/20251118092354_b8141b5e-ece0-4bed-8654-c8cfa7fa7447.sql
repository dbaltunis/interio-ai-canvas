-- Fix window_types RLS policies to allow authenticated users to view window types
-- This fixes the issue where partner accounts can't see window type options

DROP POLICY IF EXISTS "Users can view org window types" ON public.window_types;

CREATE POLICY "Authenticated users can view window types"
ON public.window_types
FOR SELECT
TO authenticated
USING (true);