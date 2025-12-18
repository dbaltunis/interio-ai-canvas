-- Seed default treatment options for Daniel's account
-- Source: Account with existing options (b0c727dd-b9bf-4470-840d-1f630e8f2b26)
-- Target: Daniel's account (c9acec0b-88a1-4d97-93fd-172a513660bc)

DO $$
DECLARE
  v_source_account_id uuid := 'b0c727dd-b9bf-4470-840d-1f630e8f2b26';
  v_target_account_id uuid := 'c9acec0b-88a1-4d97-93fd-172a513660bc';
  v_option_record RECORD;
  v_new_option_id uuid;
  v_value_record RECORD;
  v_options_created integer := 0;
  v_values_created integer := 0;
BEGIN
  -- Only proceed if target has no options
  IF EXISTS (SELECT 1 FROM treatment_options WHERE account_id = v_target_account_id LIMIT 1) THEN
    RAISE NOTICE 'Target account already has options, skipping';
    RETURN;
  END IF;

  -- Copy category-level options (not template-specific ones)
  FOR v_option_record IN 
    SELECT id, treatment_category, key, label, input_type, required, order_index, source
    FROM treatment_options
    WHERE account_id = v_source_account_id
      AND template_id IS NULL
      AND treatment_category IN ('roller_blinds', 'curtains', 'roman_blinds', 'venetian_blinds', 
                                  'vertical_blinds', 'cellular_blinds', 'shutters', 'panel_glide')
  LOOP
    -- Create new option for target account
    INSERT INTO treatment_options (
      account_id, treatment_category, key, label, input_type, required, order_index, source
    )
    VALUES (
      v_target_account_id, 
      v_option_record.treatment_category,
      v_option_record.key,
      v_option_record.label,
      v_option_record.input_type,
      v_option_record.required,
      v_option_record.order_index,
      COALESCE(v_option_record.source, 'system')
    )
    RETURNING id INTO v_new_option_id;
    
    v_options_created := v_options_created + 1;
    
    -- Copy option values
    FOR v_value_record IN
      SELECT code, label, order_index, extra_data
      FROM option_values
      WHERE option_id = v_option_record.id
        AND account_id = v_source_account_id
    LOOP
      INSERT INTO option_values (
        account_id, option_id, code, label, order_index, extra_data
      )
      VALUES (
        v_target_account_id,
        v_new_option_id,
        v_value_record.code,
        v_value_record.label,
        v_value_record.order_index,
        v_value_record.extra_data
      );
      v_values_created := v_values_created + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created % options with % values for Daniel account', v_options_created, v_values_created;
END;
$$;

-- Now bulk-enable these new options for all of Daniel's templates
DO $$
DECLARE
  v_target_account_id uuid := 'c9acec0b-88a1-4d97-93fd-172a513660bc';
  v_template_record RECORD;
  v_total_enabled integer := 0;
  v_template_enabled integer;
BEGIN
  FOR v_template_record IN 
    SELECT id, name
    FROM curtain_templates
    WHERE user_id = v_target_account_id
      AND active = true
  LOOP
    SELECT public.bulk_enable_template_options(v_template_record.id) INTO v_template_enabled;
    v_total_enabled := v_total_enabled + v_template_enabled;
  END LOOP;
  
  RAISE NOTICE 'Enabled % total options across Daniel templates', v_total_enabled;
END;
$$;