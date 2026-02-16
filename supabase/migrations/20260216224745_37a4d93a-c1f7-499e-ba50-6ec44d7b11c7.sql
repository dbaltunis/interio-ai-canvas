ALTER TABLE treatments ADD COLUMN IF NOT EXISTS primary_photo_index integer DEFAULT NULL;
ALTER TABLE windows_summary ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE windows_summary ADD COLUMN IF NOT EXISTS primary_photo_url text DEFAULT NULL;