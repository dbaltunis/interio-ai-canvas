-- Add video_call_link column to appointments_booked table
ALTER TABLE appointments_booked 
ADD COLUMN IF NOT EXISTS video_call_link TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_booked_video_call_link 
ON appointments_booked(video_call_link) 
WHERE video_call_link IS NOT NULL;