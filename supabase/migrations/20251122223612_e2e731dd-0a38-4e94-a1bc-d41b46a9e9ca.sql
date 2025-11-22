-- Add archived field to tasks table
ALTER TABLE tasks 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;