-- First delete the duplicate wqd template (keeping the first one)
DELETE FROM quote_templates 
WHERE name = 'wqd' 
AND user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND id != (
  SELECT id FROM quote_templates 
  WHERE name = 'wqd' AND user_id = 'ec930f73-ef23-4430-921f-1b401859825d' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Now add unique constraint to prevent duplicate template names per user
ALTER TABLE quote_templates 
ADD CONSTRAINT unique_template_name_per_user 
UNIQUE (user_id, name);