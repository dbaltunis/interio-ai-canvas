-- Add attachment metadata column to emails table
ALTER TABLE emails ADD COLUMN attachment_info JSONB DEFAULT '[]'::jsonb;