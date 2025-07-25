-- Add missing columns to appointment_schedulers table
ALTER TABLE appointment_schedulers 
ADD COLUMN IF NOT EXISTS google_meet_link TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT;