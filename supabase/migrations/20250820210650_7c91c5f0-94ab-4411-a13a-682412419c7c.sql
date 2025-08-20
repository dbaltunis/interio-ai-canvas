-- Fix security vulnerability: Remove overly permissive user presence policy
-- This policy allowed anyone to view all user activity data including last seen times and current pages

-- Remove the dangerous "Users can view all presence" policy that exposes user activity data
DROP POLICY IF EXISTS "Users can view all presence" ON public.user_presence;

-- Ensure the table has proper RLS enabled
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Verify that the secure team-based policy exists (it should already exist from previous migrations)
-- This policy restricts access to users within the same account/team only
DO $$
BEGIN
    -- Check if the secure team policy exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_presence' 
        AND policyname = 'Team can view presence'
    ) THEN
        CREATE POLICY "Team can view presence" 
        ON public.user_presence 
        FOR SELECT 
        USING (public.get_account_owner(auth.uid()) = public.get_account_owner(user_id));
    END IF;
END $$;

-- Also ensure users can only manage their own presence data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_presence' 
        AND policyname = 'Users manage own presence'
    ) THEN
        CREATE POLICY "Users manage own presence" 
        ON public.user_presence 
        FOR ALL 
        USING (auth.uid() = user_id OR public.is_admin()) 
        WITH CHECK (auth.uid() = user_id OR public.is_admin());
    END IF;
END $$;