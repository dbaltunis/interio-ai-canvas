-- Add missing roman_blinds and vertical_blinds options to Daniel's account
DO $$
DECLARE
  v_source_account_id uuid := 'ec930f73-ef23-4430-921f-1b401849825d'; -- Account with these options
  v_target_account_id uuid := 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'; -- Daniel's account
  v_option_record RECORD;
  v_new_option_id uuid;
  v_value_record RECORD;
  v_options_created integer := 0;
BEGIN
  -- Find source account that has roman_blinds and vertical_blinds options
  SELECT account_id INTO v_source_account_id
  FROM treatment_options
  WHERE treatment_category IN ('roman_blinds', 'vertical_blinds')
    AND template_id IS NULL
  LIMIT 1;
  
  IF v_source_account_id IS NULL THEN
    RAISE NOTICE 'No source account found with roman/vertical options';
    RETURN;
  END IF;

  -- Copy options for missing categories
  FOR v_option_record IN 
    SELECT id, treatment_category, key, label, input_type, required, order_index, source
    FROM treatment_options
    WHERE account_id = v_source_account_id
      AND template_id IS NULL
      AND treatment_category IN ('roman_blinds', 'vertical_blinds')
  LOOP
    -- Create new option
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
      'system'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_new_option_id;
    
    IF v_new_option_id IS NOT NULL THEN
      v_options_created := v_options_created + 1;
      
      -- Copy option values
      INSERT INTO option_values (account_id, option_id, code, label, order_index, extra_data)
      SELECT v_target_account_id, v_new_option_id, code, label, order_index, extra_data
      FROM option_values
      WHERE option_id = v_option_record.id;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Created % options for Daniel account', v_options_created;
END;
$$;

-- Now bulk-enable options for Daniel's templates
DO $$
DECLARE
  v_target_account_id uuid := 'b0c727dd-b9bf-4470-840d-1f630e8f2b26';
  v_template_record RECORD;
  v_enabled integer;
BEGIN
  FOR v_template_record IN 
    SELECT id, name FROM curtain_templates
    WHERE user_id = v_target_account_id AND active = true
  LOOP
    SELECT public.bulk_enable_template_options(v_template_record.id) INTO v_enabled;
    IF v_enabled > 0 THEN
      RAISE NOTICE 'Enabled % options for %', v_enabled, v_template_record.name;
    END IF;
  END LOOP;
END;
$$;