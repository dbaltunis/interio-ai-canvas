
-- Seed default client_stages for ALL Account Owners who don't have them
-- This fixes the issue where contact stages are not visible to other accounts

DO $$
DECLARE
  owner_record RECORD;
BEGIN
  -- Loop through all Account Owners who don't have any stages
  FOR owner_record IN 
    SELECT up.user_id
    FROM user_profiles up
    LEFT JOIN client_stages cs ON cs.user_id = up.user_id
    WHERE up.role = 'Account Owner'
    GROUP BY up.user_id
    HAVING COUNT(cs.id) = 0
  LOOP
    -- Insert 10 default stages for each owner
    INSERT INTO client_stages (user_id, slot_number, name, label, color, description, is_default, is_active)
    VALUES
      (owner_record.user_id, 1, 'lead', 'Lead', 'gray', 'New potential customer', false, true),
      (owner_record.user_id, 2, 'contacted', 'Contacted', 'blue', 'Initial contact made', false, true),
      (owner_record.user_id, 3, 'qualified', 'Qualified', 'yellow', 'Confirmed interest and budget', false, true),
      (owner_record.user_id, 4, 'quoted', 'Quoted', 'purple', 'Quote/proposal sent', false, true),
      (owner_record.user_id, 5, 'negotiation', 'Negotiation', 'orange', 'Discussing terms', false, true),
      (owner_record.user_id, 6, 'approved', 'Approved', 'green', 'Deal approved', false, true),
      (owner_record.user_id, 7, 'trial', 'Trial', 'blue', 'Trial period active', false, true),
      (owner_record.user_id, 8, 'customer', 'Customer', 'green', 'Active customer', true, true),
      (owner_record.user_id, 9, 'churned', 'Churned', 'red', 'Lost or cancelled', false, true),
      (owner_record.user_id, 10, 'vip', 'VIP', 'primary', 'Premium segment', false, true);
    
    RAISE NOTICE 'Seeded stages for user: %', owner_record.user_id;
  END LOOP;
END $$;
