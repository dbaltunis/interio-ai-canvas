-- Fix Zebra Blind materials to use correct Homekaara account
UPDATE enhanced_inventory_items 
SET user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
WHERE subcategory = 'zebra_fabric' 
AND user_id = 'ec930f73-ef23-4430-921f-1b401859825d';