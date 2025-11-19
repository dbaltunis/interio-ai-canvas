-- Backfill window types for existing Owner accounts without window types
DO $$
DECLARE
  owner_record RECORD;
  total_accounts INTEGER := 0;
  total_seeded INTEGER := 0;
  seed_count INTEGER;
BEGIN
  RAISE LOG 'Starting window types backfill for existing accounts...';
  
  -- Find all account owners without window types
  FOR owner_record IN
    SELECT up.user_id, up.display_name 
    FROM user_profiles up
    LEFT JOIN window_types wt ON wt.org_id = up.user_id
    WHERE up.role = 'Owner' 
      AND up.parent_account_id IS NULL
      AND wt.id IS NULL
    GROUP BY up.user_id, up.display_name
  LOOP
    total_accounts := total_accounts + 1;
    
    -- Seed window types for this account
    SELECT seed_default_window_types(owner_record.user_id) INTO seed_count;
    
    IF seed_count > 0 THEN
      total_seeded := total_seeded + 1;
      RAISE LOG 'Seeded % window types for account: % (ID: %)', 
        seed_count, owner_record.display_name, owner_record.user_id;
    END IF;
  END LOOP;
  
  RAISE LOG 'Backfill complete: Seeded window types for %/% accounts', total_seeded, total_accounts;
  
  -- Log total accounts with window types after backfill
  SELECT COUNT(DISTINCT org_id) INTO total_accounts
  FROM window_types;
  
  RAISE LOG 'Total accounts with window types after backfill: %', total_accounts;
END $$;