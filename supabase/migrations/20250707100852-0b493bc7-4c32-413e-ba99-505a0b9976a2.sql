-- Update existing Shopify integration record to use correct domain format
UPDATE shopify_integrations 
SET shop_domain = 'curtains-calculator.myshopify.com'
WHERE shop_domain = 'https://www.curtainscalculator.com';