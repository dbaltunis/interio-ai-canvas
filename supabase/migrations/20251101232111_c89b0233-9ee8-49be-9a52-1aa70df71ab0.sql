
-- Phase 6: Enhanced Team Calendar System

-- 1. Add organization-wide sharing field to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS shared_with_organization BOOLEAN DEFAULT FALSE;

-- 2. Add calendar visibility preference
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'organization'));

-- 3. Update RLS policy to show organization-wide appointments to team members
DROP POLICY IF EXISTS "Team members can view organization calendar" ON appointments;
CREATE POLICY "Team members can view organization calendar"
ON appointments
FOR SELECT
TO authenticated
USING (
  -- Organization-wide events visible to all team members
  (shared_with_organization = true 
   AND get_account_owner(auth.uid()) = get_account_owner(user_id))
  OR
  -- Visibility-based access
  (visibility = 'organization' 
   AND get_account_owner(auth.uid()) = get_account_owner(user_id))
);

-- 4. Create calendar_preferences table for user settings
CREATE TABLE IF NOT EXISTS calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_view TEXT DEFAULT 'week' CHECK (default_view IN ('day', 'week', 'month', 'agenda')),
  show_organization_events BOOLEAN DEFAULT TRUE,
  show_team_events BOOLEAN DEFAULT TRUE,
  show_personal_events BOOLEAN DEFAULT TRUE,
  default_event_visibility TEXT DEFAULT 'private' CHECK (default_event_visibility IN ('private', 'team', 'organization')),
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Enable RLS on calendar_preferences
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for calendar_preferences
CREATE POLICY "Users can view own calendar preferences"
ON calendar_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar preferences"
ON calendar_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar preferences"
ON calendar_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Add comments for documentation
COMMENT ON COLUMN appointments.shared_with_organization IS 
  'When true, appointment is visible to all users in the same organization';
  
COMMENT ON COLUMN appointments.visibility IS 
  'Controls appointment visibility: private (only owner), team (shared via team_member_ids), organization (all team members)';

COMMENT ON TABLE calendar_preferences IS 
  'User preferences for calendar display and default settings';

-- 8. Create trigger for updated_at
CREATE TRIGGER update_calendar_preferences_updated_at
  BEFORE UPDATE ON calendar_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
