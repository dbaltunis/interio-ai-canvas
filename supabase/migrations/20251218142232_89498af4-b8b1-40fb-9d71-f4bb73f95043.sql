-- Step 1: Clean up ALL incorrect template_option_settings for Daniel's account
-- Delete settings where TWC option key suffix doesn't match the template_id
DELETE FROM template_option_settings
WHERE template_id IN (
  SELECT id FROM curtain_templates 
  WHERE user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
)
AND treatment_option_id IN (
  SELECT to_opt.id 
  FROM treatment_options to_opt
  WHERE to_opt.key LIKE '%\_%'
    AND to_opt.source = 'twc'
);

-- Step 2: Fix the bulk_enable_template_options function to properly match TWC options
CREATE OR REPLACE FUNCTION public.bulk_enable_template_options(p_template_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_template_record RECORD;
  v_option_record RECORD;
  v_enabled_count integer := 0;
  v_template_id_suffix text;
BEGIN
  -- Get template info
  SELECT id, user_id, treatment_category 
  INTO v_template_record
  FROM curtain_templates 
  WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Template % not found', p_template_id;
    RETURN 0;
  END IF;
  
  -- Extract template ID suffix for TWC matching (first 8 chars of UUID)
  v_template_id_suffix := substring(p_template_id::text from 1 for 8);
  
  -- Enable options that match this template
  FOR v_option_record IN
    SELECT id, key, source, treatment_category, order_index
    FROM treatment_options
    WHERE account_id = v_template_record.user_id
      AND template_id IS NULL -- Global options only
      AND treatment_category = v_template_record.treatment_category
  LOOP
    -- For TWC options: only link if key suffix matches template ID
    IF v_option_record.source = 'twc' THEN
      -- TWC option keys have format: option_name_TEMPLATEID (e.g., fabric_ffc1d6f7)
      -- Only link if the suffix matches this template's ID
      IF v_option_record.key LIKE '%\_' || v_template_id_suffix THEN
        INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
        VALUES (p_template_id, v_option_record.id, true, v_option_record.order_index)
        ON CONFLICT (template_id, treatment_option_id) DO UPDATE SET is_enabled = true;
        v_enabled_count := v_enabled_count + 1;
      END IF;
    ELSE
      -- For system/custom options: link all matching category options
      INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
      VALUES (p_template_id, v_option_record.id, true, v_option_record.order_index)
      ON CONFLICT (template_id, treatment_option_id) DO UPDATE SET is_enabled = true;
      v_enabled_count := v_enabled_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_enabled_count;
END;
$function$;

-- Step 3: Re-enable correct options for Daniel's templates
DO $$
DECLARE
  v_target_account_id uuid := 'b0c727dd-b9bf-4470-840d-1f630e8f2b26';
  v_template_record RECORD;
  v_enabled integer;
  v_total_enabled integer := 0;
BEGIN
  FOR v_template_record IN 
    SELECT id, name FROM curtain_templates
    WHERE user_id = v_target_account_id AND active = true
  LOOP
    SELECT public.bulk_enable_template_options(v_template_record.id) INTO v_enabled;
    v_total_enabled := v_total_enabled + v_enabled;
    RAISE NOTICE 'Template "%": enabled % options', v_template_record.name, v_enabled;
  END LOOP;
  
  RAISE NOTICE 'Total: enabled % options across all templates', v_total_enabled;
END;
$$;