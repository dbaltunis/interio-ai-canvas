-- Create default business settings for parent accounts without settings
-- This ensures all parent accounts have settings that child accounts can inherit

DO $$
DECLARE
  parent_user RECORD;
  default_units JSONB;
BEGIN
  -- Define default measurement units
  default_units := jsonb_build_object(
    'system', 'imperial',
    'length', 'inches',
    'area', 'sq_inches',
    'fabric', 'yards',
    'currency', 'USD'
  );

  -- Loop through parent accounts (users where parent_account_id IS NULL or equals user_id)
  FOR parent_user IN 
    SELECT DISTINCT up.user_id
    FROM public.user_profiles up
    LEFT JOIN public.business_settings bs ON bs.user_id = up.user_id
    WHERE (up.parent_account_id IS NULL OR up.parent_account_id = up.user_id)
      AND bs.id IS NULL  -- Only users without existing settings
  LOOP
    -- Insert default business settings for this parent account
    INSERT INTO public.business_settings (
      user_id,
      company_name,
      measurement_units,
      tax_rate,
      tax_type,
      allow_in_app_template_editing,
      default_profit_margin_percentage,
      minimum_profit_margin_percentage,
      show_profit_margins_to_staff,
      show_vendor_costs_to_managers,
      show_vendor_costs_to_staff,
      features_enabled,
      inventory_config,
      created_at,
      updated_at
    ) VALUES (
      parent_user.user_id,
      'My Company',  -- Default company name
      default_units::text,  -- Convert JSONB to text for storage
      0.00,  -- Default tax rate
      'none',  -- Default tax type
      true,  -- Allow template editing
      30.00,  -- Default 30% profit margin
      15.00,  -- Minimum 15% profit margin
      false,  -- Don't show profit margins to staff by default
      true,  -- Show vendor costs to managers by default
      false,  -- Don't show vendor costs to staff by default
      jsonb_build_object(
        'inventory_management', true,
        'auto_extract_materials', false,
        'leftover_tracking', false,
        'order_batching', false,
        'multi_location_inventory', false
      ),
      jsonb_build_object(
        'track_leftovers', false,
        'waste_buffer_percentage', 10.0,
        'auto_reorder_enabled', false,
        'reorder_threshold_percentage', 20.0,
        'default_location', 'Main Warehouse'
      ),
      now(),
      now()
    );
    
    RAISE NOTICE 'Created default business settings for user: %', parent_user.user_id;
  END LOOP;
  
  RAISE NOTICE 'Default business settings creation complete';
END $$;