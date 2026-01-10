-- Add option type categories for the new hardware options (Homekaara account)
INSERT INTO option_type_categories (
  id, type_key, type_label, treatment_category, sort_order, 
  active, hidden_by_user, account_id, user_id
)
VALUES 
  (gen_random_uuid(), 'mount_type', 'Mount Type', 'curtains', 5, 
   true, false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 
   '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'hardware_type', 'Hardware Type', 'curtains', 6, 
   true, false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 
   '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'track_selection', 'Select Track', 'curtains', 7, 
   true, false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 
   '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'rod_selection', 'Select Rod', 'curtains', 8, 
   true, false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 
   '708d8e36-8fa3-4e07-b43b-c0a90941f991')
ON CONFLICT DO NOTHING;