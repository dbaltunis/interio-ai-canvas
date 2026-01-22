-- =====================================================
-- Fix Client Stages: Correct seeding for all Owners
-- =====================================================

-- STEP 1: Seed stages for all existing Owners who have none
-- Uses correct role names: 'Owner' and 'System Owner'

DO $$
DECLARE
  owner_record RECORD;
  seeded_count INTEGER := 0;
BEGIN
  FOR owner_record IN 
    SELECT up.user_id
    FROM user_profiles up
    LEFT JOIN client_stages cs ON cs.user_id = up.user_id
    WHERE up.role IN ('Owner', 'System Owner')
    AND (up.parent_account_id IS NULL OR up.role = 'System Owner')
    GROUP BY up.user_id
    HAVING COUNT(cs.id) = 0
  LOOP
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
    
    seeded_count := seeded_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Seeded client stages for % accounts', seeded_count;
END $$;

-- STEP 2: Create auto-seeding function for new accounts

CREATE OR REPLACE FUNCTION public.seed_default_client_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Only seed for new account owners (not team members)
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    -- Check if stages already exist
    IF NOT EXISTS (SELECT 1 FROM client_stages WHERE user_id = NEW.user_id) THEN
      INSERT INTO client_stages (user_id, slot_number, name, label, color, description, is_default, is_active)
      VALUES
        (NEW.user_id, 1, 'lead', 'Lead', 'gray', 'New potential customer', false, true),
        (NEW.user_id, 2, 'contacted', 'Contacted', 'blue', 'Initial contact made', false, true),
        (NEW.user_id, 3, 'qualified', 'Qualified', 'yellow', 'Confirmed interest and budget', false, true),
        (NEW.user_id, 4, 'quoted', 'Quoted', 'purple', 'Quote/proposal sent', false, true),
        (NEW.user_id, 5, 'negotiation', 'Negotiation', 'orange', 'Discussing terms', false, true),
        (NEW.user_id, 6, 'approved', 'Approved', 'green', 'Deal approved', false, true),
        (NEW.user_id, 7, 'trial', 'Trial', 'blue', 'Trial period active', false, true),
        (NEW.user_id, 8, 'customer', 'Customer', 'green', 'Active customer', true, true),
        (NEW.user_id, 9, 'churned', 'Churned', 'red', 'Lost or cancelled', false, true),
        (NEW.user_id, 10, 'vip', 'VIP', 'primary', 'Premium segment', false, true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create trigger for new accounts

DROP TRIGGER IF EXISTS trigger_seed_client_stages ON user_profiles;

CREATE TRIGGER trigger_seed_client_stages
  AFTER INSERT OR UPDATE OF role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_client_stages();

-- STEP 4: Update RLS policies for multi-tenant support

DROP POLICY IF EXISTS "Users can view their own client stages" ON public.client_stages;
DROP POLICY IF EXISTS "Users can create their own client stages" ON public.client_stages;
DROP POLICY IF EXISTS "Users can update their own client stages" ON public.client_stages;
DROP POLICY IF EXISTS "Users can delete their own client stages" ON public.client_stages;
DROP POLICY IF EXISTS "client_stages_select_policy" ON public.client_stages;
DROP POLICY IF EXISTS "client_stages_insert_policy" ON public.client_stages;
DROP POLICY IF EXISTS "client_stages_update_policy" ON public.client_stages;
DROP POLICY IF EXISTS "client_stages_delete_policy" ON public.client_stages;

CREATE POLICY "client_stages_select_policy" ON public.client_stages
  FOR SELECT USING (
    public.get_effective_account_owner(auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'System Owner'
    )
  );

CREATE POLICY "client_stages_insert_policy" ON public.client_stages
  FOR INSERT WITH CHECK (
    public.get_effective_account_owner(auth.uid()) = user_id
  );

CREATE POLICY "client_stages_update_policy" ON public.client_stages
  FOR UPDATE USING (
    public.get_effective_account_owner(auth.uid()) = user_id
  );

CREATE POLICY "client_stages_delete_policy" ON public.client_stages
  FOR DELETE USING (
    public.get_effective_account_owner(auth.uid()) = user_id
  );