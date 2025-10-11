-- Add Room Wall window type for wallpaper measurements
-- Insert with the first org_id from existing window_types
INSERT INTO window_types (org_id, name, key, visual_key, created_at, updated_at)
SELECT 
  (SELECT org_id FROM window_types LIMIT 1) as org_id,
  'Room Wall', 
  'room_wall', 
  'room_wall', 
  now(), 
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM window_types WHERE key = 'room_wall'
);