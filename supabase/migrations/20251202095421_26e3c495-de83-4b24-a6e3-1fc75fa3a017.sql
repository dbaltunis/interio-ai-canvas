-- Fix is_connected default to true and fix Daniel's existing record

-- Change default value for is_connected column to true
ALTER TABLE shopify_integrations 
ALTER COLUMN is_connected SET DEFAULT true;

-- Fix Daniel's existing record where OAuth completed but is_connected was not set
UPDATE shopify_integrations 
SET is_connected = true 
WHERE user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND shop_domain IS NOT NULL 
AND access_token IS NOT NULL;