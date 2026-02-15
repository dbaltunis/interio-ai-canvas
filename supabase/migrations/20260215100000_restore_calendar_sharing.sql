-- Restore calendar delegation/sharing tables with simplified RLS
-- Previous implementation was dropped in 20250805101301 due to recursive RLS issues.
-- This version uses a simpler approach: team-based sharing via parent_account_id
-- instead of per-record RLS that caused circular policy evaluation.

-- 1. Calendar delegation table (who can see/edit whose calendar)
CREATE TABLE IF NOT EXISTS public.calendar_delegations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'manage')),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_id, delegate_id)
);

-- 2. Appointment shares table (individual appointment sharing)
CREATE TABLE IF NOT EXISTS public.appointment_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'manage')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(appointment_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.calendar_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_shares ENABLE ROW LEVEL SECURITY;

-- Calendar delegations RLS: owner and delegate can see their records
-- Uses simple direct user checks (no subqueries that caused recursion)
CREATE POLICY "Users can view own delegations"
  ON public.calendar_delegations FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = delegate_id);

CREATE POLICY "Users can create delegations for own calendar"
  ON public.calendar_delegations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update delegations"
  ON public.calendar_delegations FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete delegations"
  ON public.calendar_delegations FOR DELETE
  USING (auth.uid() = owner_id);

-- Appointment shares RLS: owner and shared user can see
CREATE POLICY "Users can view own appointment shares"
  ON public.appointment_shares FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Users can share own appointments"
  ON public.appointment_shares FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update appointment shares"
  ON public.appointment_shares FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete appointment shares"
  ON public.appointment_shares FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_delegations_owner ON public.calendar_delegations(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendar_delegations_delegate ON public.calendar_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_appointment_shares_appointment ON public.appointment_shares(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_shares_shared_with ON public.appointment_shares(shared_with_user_id);

-- Update the appointments RLS to include delegation access
-- Drop the old policy that referenced the dropped table
DO $$
BEGIN
  -- Drop old policy if it exists (it references the dropped appointment_shares table)
  DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;

  -- Create updated policy that includes calendar_delegations
  CREATE POLICY "Users can view appointments" ON public.appointments
    FOR SELECT USING (
      -- Own appointments
      auth.uid() = user_id
      -- Team member appointments (same account)
      OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid()
        AND (
          up.parent_account_id = appointments.user_id
          OR up.parent_account_id = (
            SELECT up2.parent_account_id FROM public.user_profiles up2
            WHERE up2.user_id = appointments.user_id
          )
        )
      )
      -- Assigned as team member
      OR auth.uid() = ANY(team_member_ids)
      -- Delegated calendar access
      OR EXISTS (
        SELECT 1 FROM public.calendar_delegations cd
        WHERE cd.delegate_id = auth.uid()
        AND cd.owner_id = appointments.user_id
      )
      -- Individual appointment share
      OR EXISTS (
        SELECT 1 FROM public.appointment_shares ash
        WHERE ash.shared_with_user_id = auth.uid()
        AND ash.appointment_id = appointments.id
      )
      -- Admin override
      OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid() AND up.role IN ('System Owner', 'Admin')
      )
    );
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
