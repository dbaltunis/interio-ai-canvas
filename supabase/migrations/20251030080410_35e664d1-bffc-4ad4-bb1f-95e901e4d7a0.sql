-- Add video meeting provider fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS video_provider text CHECK (video_provider IN ('google_meet', 'zoom', 'teams', 'manual')),
ADD COLUMN IF NOT EXISTS video_meeting_data jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN appointments.video_provider IS 'Video meeting platform: google_meet, zoom, teams, or manual';
COMMENT ON COLUMN appointments.video_meeting_data IS 'Additional meeting data like meeting ID, passcode, etc.';