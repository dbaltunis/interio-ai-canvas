-- Bulk-enable template options for all templates without settings
-- This finds templates that have NO template_option_settings and creates them

-- Create a function to bulk-enable options for a template
CREATE OR REPLACE FUNCTION public.bulk_enable_template_options(p_template_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_category text;
  v_account_id uuid;
  v_options_count integer := 0;
BEGIN
  -- Get template info
  SELECT treatment_category, user_id 
  INTO v_template_category, v_account_id
  FROM curtain_templates
  WHERE id = p_template_id;
  
  IF v_template_category IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Insert template_option_settings for all matching options
  INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
  SELECT 
    p_template_id,
    to_opt.id,
    true,
    to_opt.order_index
  FROM treatment_options to_opt
  WHERE to_opt.account_id = v_account_id
    AND to_opt.treatment_category = v_template_category
    AND to_opt.template_id IS NULL  -- Only category-level options
    AND NOT EXISTS (
      SELECT 1 FROM template_option_settings tos 
      WHERE tos.template_id = p_template_id 
        AND tos.treatment_option_id = to_opt.id
    )
  ON CONFLICT (template_id, treatment_option_id) DO NOTHING;
  
  GET DIAGNOSTICS v_options_count = ROW_COUNT;
  
  RETURN v_options_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.bulk_enable_template_options(uuid) TO authenticated;

-- Now bulk-enable for all templates that have 0 option settings
DO $$
DECLARE
  v_template_record RECORD;
  v_total_enabled integer := 0;
  v_template_enabled integer;
BEGIN
  FOR v_template_record IN 
    SELECT ct.id, ct.name, ct.treatment_category
    FROM curtain_templates ct
    WHERE ct.active = true
      AND NOT EXISTS (
        SELECT 1 FROM template_option_settings tos 
        WHERE tos.template_id = ct.id
      )
  LOOP
    SELECT public.bulk_enable_template_options(v_template_record.id) INTO v_template_enabled;
    v_total_enabled := v_total_enabled + v_template_enabled;
    RAISE NOTICE 'Enabled % options for template: %', v_template_enabled, v_template_record.name;
  END LOOP;
  
  RAISE NOTICE 'Total options enabled across all templates: %', v_total_enabled;
END;
$$;