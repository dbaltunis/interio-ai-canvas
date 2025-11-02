-- Clean up custom permissions for Staff test user to enable proper permission testing
DELETE FROM user_permissions 
WHERE user_id = '59ca604b-a3cc-47ca-9d9a-7f2945aab19b';