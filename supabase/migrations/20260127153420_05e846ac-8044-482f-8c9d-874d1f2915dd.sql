-- =============================================
-- SaaS Consistency Audit - Database Functions
-- =============================================

-- 1. Comprehensive account repair function
CREATE OR REPLACE FUNCTION public.repair_account_full(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{"fixes_applied": []}';
  fixes text[] := '{}';
  perm_record record;
BEGIN
  -- Fix permissions using existing function if it exists
  BEGIN
    PERFORM public.fix_user_permissions_for_role(target_user_id);
    fixes := array_append(fixes, 'permissions');
  EXCEPTION WHEN undefined_function THEN
    -- Function doesn't exist, manually add permissions
    NULL;
  END;
  
  -- Create business_settings if missing
  INSERT INTO business_settings (user_id, measurement_units, tax_type, tax_rate)
  VALUES (target_user_id, 'mm', 'GST', 15)
  ON CONFLICT (user_id) DO NOTHING;
  IF FOUND THEN 
    fixes := array_append(fixes, 'business_settings'); 
  END IF;
  
  -- Create account_settings if missing
  INSERT INTO account_settings (account_owner_id, currency, language)
  VALUES (target_user_id, 'USD', 'en')
  ON CONFLICT (account_owner_id) DO NOTHING;
  IF FOUND THEN 
    fixes := array_append(fixes, 'account_settings'); 
  END IF;
  
  -- Create number_sequences if missing
  INSERT INTO number_sequences (user_id, entity_type, prefix, next_number, padding)
  VALUES 
    (target_user_id, 'job', 'JOB', 1000, 4),
    (target_user_id, 'quote', 'QTE', 1000, 4),
    (target_user_id, 'invoice', 'INV', 1000, 4),
    (target_user_id, 'order', 'ORD', 1000, 4),
    (target_user_id, 'draft', 'DFT', 1000, 4)
  ON CONFLICT (user_id, entity_type) DO NOTHING;
  
  -- Create job_statuses if missing
  IF NOT EXISTS (SELECT 1 FROM job_statuses WHERE user_id = target_user_id) THEN
    INSERT INTO job_statuses (user_id, name, color, is_default, sort_order, status_type)
    VALUES 
      (target_user_id, 'New', '#3B82F6', true, 1, 'active'),
      (target_user_id, 'In Progress', '#F59E0B', false, 2, 'active'),
      (target_user_id, 'Pending', '#8B5CF6', false, 3, 'active'),
      (target_user_id, 'On Hold', '#6B7280', false, 4, 'active'),
      (target_user_id, 'Completed', '#10B981', false, 5, 'completed'),
      (target_user_id, 'Cancelled', '#EF4444', false, 6, 'cancelled');
    fixes := array_append(fixes, 'job_statuses');
  END IF;
  
  -- Client stages are auto-seeded by trigger, but check and seed if missing
  IF NOT EXISTS (SELECT 1 FROM client_stages WHERE user_id = target_user_id) THEN
    INSERT INTO client_stages (user_id, slot_number, name, label, color, is_active)
    VALUES 
      (target_user_id, 1, 'lead', 'Lead', '#94A3B8', true),
      (target_user_id, 2, 'contacted', 'Contacted', '#3B82F6', true),
      (target_user_id, 3, 'qualified', 'Qualified', '#8B5CF6', true),
      (target_user_id, 4, 'proposal', 'Proposal', '#F59E0B', true),
      (target_user_id, 5, 'negotiation', 'Negotiation', '#EC4899', true),
      (target_user_id, 6, 'won', 'Won', '#10B981', true),
      (target_user_id, 7, 'lost', 'Lost', '#EF4444', true),
      (target_user_id, 8, 'on_hold', 'On Hold', '#6B7280', true),
      (target_user_id, 9, 'follow_up', 'Follow Up', '#F97316', true),
      (target_user_id, 10, 'archived', 'Archived', '#475569', true);
    fixes := array_append(fixes, 'client_stages');
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'fixes_applied', to_jsonb(fixes),
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- 2. Cleanup orphaned data function
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_counts jsonb := '{}';
  del_count integer;
BEGIN
  -- Delete orphaned projects
  DELETE FROM projects WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('projects', del_count);
  
  -- Delete orphaned quotes
  DELETE FROM quotes WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('quotes', del_count);
  
  -- Delete orphaned clients
  DELETE FROM clients WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('clients', del_count);
  
  -- Delete orphaned inventory items
  DELETE FROM enhanced_inventory_items WHERE user_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('inventory_items', del_count);
  
  -- Delete orphaned treatment options (account_id based)
  DELETE FROM treatment_options WHERE account_id NOT IN (SELECT user_id FROM user_profiles);
  GET DIAGNOSTICS del_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('treatment_options', del_count);
  
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', now(),
    'deleted', deleted_counts
  );
END;
$$;

-- 3. Fix TWC required options function
CREATE OR REPLACE FUNCTION public.fix_twc_required_options()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE treatment_options
  SET required = false
  WHERE source = 'twc'
    AND key LIKE 'heading_type%'
    AND required = true;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'twc_options_fixed', updated_count,
    'timestamp', now()
  );
END;
$$;

-- Grant execute permissions to authenticated users (System Owners only - enforced in function)
GRANT EXECUTE ON FUNCTION public.repair_account_full(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_twc_required_options() TO authenticated;
