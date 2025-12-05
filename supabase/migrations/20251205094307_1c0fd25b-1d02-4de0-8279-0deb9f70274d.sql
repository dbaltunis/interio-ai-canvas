-- Fix existing templates with underscore block types to use hyphens
-- This ensures consistency between template storage and LivePreview rendering

-- Fix client_info -> client-info
UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type":"client_info"', '"type":"client-info"')::jsonb
WHERE blocks::text LIKE '%"type":"client_info"%';

UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type": "client_info"', '"type": "client-info"')::jsonb
WHERE blocks::text LIKE '%"type": "client_info"%';

-- Fix line_items -> line-items
UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type":"line_items"', '"type":"line-items"')::jsonb
WHERE blocks::text LIKE '%"type":"line_items"%';

UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type": "line_items"', '"type": "line-items"')::jsonb
WHERE blocks::text LIKE '%"type": "line_items"%';

-- Fix room_breakdown -> room-breakdown
UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type":"room_breakdown"', '"type":"room-breakdown"')::jsonb
WHERE blocks::text LIKE '%"type":"room_breakdown"%';

UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type": "room_breakdown"', '"type": "room-breakdown"')::jsonb
WHERE blocks::text LIKE '%"type": "room_breakdown"%';

-- Fix any other underscore types that might exist
UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type":"payment_terms"', '"type":"payment-terms"')::jsonb
WHERE blocks::text LIKE '%"type":"payment_terms"%';

UPDATE quote_templates 
SET blocks = REPLACE(blocks::text, '"type": "payment_terms"', '"type": "payment-terms"')::jsonb
WHERE blocks::text LIKE '%"type": "payment_terms"%';