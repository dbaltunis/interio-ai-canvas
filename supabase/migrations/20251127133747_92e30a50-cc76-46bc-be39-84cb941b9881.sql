-- Create trigger function to automatically seed default options for new accounts
CREATE OR REPLACE FUNCTION seed_new_account_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only seed for account owners (parent_account_id IS NULL)
  -- Team members inherit their parent account's options
  IF NEW.parent_account_id IS NULL THEN
    -- Seed default treatment options for this new account
    PERFORM seed_account_options(NEW.user_id);
    
    RAISE LOG 'Seeded default treatment options for new account: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_profiles INSERT
DROP TRIGGER IF EXISTS trigger_seed_account_defaults ON user_profiles;
CREATE TRIGGER trigger_seed_account_defaults
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION seed_new_account_defaults();

COMMENT ON FUNCTION seed_new_account_defaults() IS 
  'Automatically seeds system default treatment options when a new account owner signs up. Team members inherit their parent account options.';
COMMENT ON TRIGGER trigger_seed_account_defaults ON user_profiles IS 
  'Seeds default options for new account owners during signup';
