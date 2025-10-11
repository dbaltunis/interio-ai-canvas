-- Update Room Wall to use the correct org_id that matches other visible window types
UPDATE window_types 
SET org_id = 'ec930f73-ef23-4430-921f-1b401859825d'
WHERE key = 'room_wall';