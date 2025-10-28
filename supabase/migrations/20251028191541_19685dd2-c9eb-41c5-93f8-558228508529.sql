-- Phase 1: Add new columns to job_statuses table
ALTER TABLE job_statuses
ADD COLUMN slot_number INTEGER,
ADD COLUMN is_default BOOLEAN DEFAULT false,
ADD CONSTRAINT unique_user_slot UNIQUE (user_id, slot_number);

-- Add index for better query performance
CREATE INDEX idx_job_statuses_slot ON job_statuses(user_id, slot_number) WHERE is_active = true;

-- Comment to describe the slot system
COMMENT ON COLUMN job_statuses.slot_number IS 'Slot number (1-10) that determines the fixed position in the workflow sequence';