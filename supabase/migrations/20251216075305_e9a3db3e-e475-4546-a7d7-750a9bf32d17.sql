-- Update Homekaara business settings with logo
UPDATE business_settings 
SET 
  company_logo_url = '/logos/homekaara-logo.png',
  updated_at = now()
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- Verify the update
SELECT company_name, company_logo_url FROM business_settings 
WHERE user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';