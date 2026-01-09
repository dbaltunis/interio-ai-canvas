-- Add all 77 Owner permissions to Auguste Klimaite account
-- First get the complete list from a working account
INSERT INTO user_permissions (user_id, permission_name)
SELECT '5d0c0c13-9a72-41e7-9e4c-1947fb4d6e4a'::uuid, permission_name
FROM user_permissions 
WHERE user_id = '7dad89a1-9ae8-454d-a327-9bcd42ed50e0' -- test provisioning with 77
ON CONFLICT (user_id, permission_name) DO NOTHING;