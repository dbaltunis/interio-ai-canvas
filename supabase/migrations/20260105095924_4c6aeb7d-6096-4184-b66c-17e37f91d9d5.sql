-- Fix existing client ownership mismatches
-- Update client user_id to match project user_id when they're linked but mismatched
UPDATE clients c
SET user_id = p.user_id,
    updated_at = now()
FROM projects p
WHERE p.client_id = c.id
AND p.user_id != c.user_id;