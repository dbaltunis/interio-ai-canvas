-- Add due_time field to tasks table to specify what time the task should appear in calendar
ALTER TABLE tasks 
ADD COLUMN due_time TIME DEFAULT '09:00:00';