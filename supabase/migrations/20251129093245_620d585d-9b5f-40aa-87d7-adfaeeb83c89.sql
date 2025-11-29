-- ============================================
-- FIX: Create auto-seed trigger for new accounts
-- ============================================

-- 1. Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_seed_account_defaults()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only seed for account owners (no parent_account_id) and not System Owner
  IF NEW.parent_account_id IS NULL AND NEW.role != 'System Owner' THEN
    -- Call the seed function for this new account
    PERFORM seed_account_options(NEW.user_id);
    
    RAISE LOG 'Auto-seeded treatment options for new account: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger on user_profiles
DROP TRIGGER IF EXISTS trigger_seed_account_defaults ON user_profiles;

CREATE TRIGGER trigger_seed_account_defaults
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_account_defaults();

-- 3. Manually seed existing accounts that have 0 options
DO $$
DECLARE
  account_record RECORD;
BEGIN
  -- Find all account owners with 0 options
  FOR account_record IN 
    SELECT 
      up.user_id
    FROM user_profiles up
    LEFT JOIN treatment_options to1 ON to1.account_id = up.user_id
    WHERE up.parent_account_id IS NULL
      AND up.role != 'System Owner'
    GROUP BY up.user_id
    HAVING COUNT(to1.id) = 0
  LOOP
    -- Seed each empty account
    PERFORM seed_account_options(account_record.user_id);
    RAISE NOTICE 'Seeded account: %', account_record.user_id;
  END LOOP;
END $$;