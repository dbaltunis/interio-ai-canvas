-- Fix appointments with invalid date ranges (end_time before or equal to start_time)
-- Delete appointments that are clearly broken (created more than 24 hours ago and still invalid)
DELETE FROM appointments
WHERE end_time <= start_time 
  AND created_at < NOW() - interval '24 hours';

-- For recent invalid appointments (created within last 24 hours), set end_time to 1 hour after start_time
UPDATE appointments
SET 
  end_time = start_time + interval '1 hour',
  updated_at = NOW()
WHERE end_time <= start_time
  AND created_at >= NOW() - interval '24 hours';

-- Add a check constraint to prevent future invalid dates (PostgreSQL will validate on INSERT/UPDATE)
-- Note: This uses a CHECK constraint which validates data integrity
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_valid_time_range'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_valid_time_range
    CHECK (end_time > start_time);
  END IF;
END $$;