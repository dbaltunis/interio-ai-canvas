
-- Fix seed_account_options to match actual treatment_options schema
CREATE OR REPLACE FUNCTION seed_account_options(target_account_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  options_created INTEGER := 0;
  default_option RECORD;
  new_option_id UUID;
BEGIN
  FOR default_option IN 
    SELECT * FROM system_default_options
    ORDER BY treatment_category, sort_order
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM treatment_options
      WHERE account_id = target_account_id
      AND treatment_category = default_option.treatment_category
      AND key = default_option.key
    ) THEN
      -- Insert matching actual treatment_options schema (no description, no template_id, no treatment_id)
      INSERT INTO treatment_options (
        account_id,
        treatment_category,
        key,
        label,
        input_type,
        required,
        visible,
        order_index
      ) VALUES (
        target_account_id,
        default_option.treatment_category,
        default_option.key,
        default_option.label,
        default_option.input_type::text::option_input_type, -- Cast to proper enum type
        false, -- required defaults to false
        true,  -- visible defaults to true
        default_option.sort_order -- Map sort_order to order_index
      )
      RETURNING id INTO new_option_id;
      
      -- Seed default option values if they exist
      IF default_option.default_values IS NOT NULL AND jsonb_array_length(default_option.default_values) > 0 THEN
        INSERT INTO option_values (option_id, account_id, code, label, order_index)
        SELECT 
          new_option_id,
          target_account_id,
          (item->>'code')::text,
          (item->>'label')::text,
          (row_number() OVER ())::integer
        FROM jsonb_array_elements(default_option.default_values) AS item;
      END IF;
      
      options_created := options_created + 1;
    END IF;
  END LOOP;
  
  RETURN options_created;
END;
$$;

COMMENT ON FUNCTION seed_account_options(UUID) IS 
  'Seeds system default treatment options for a specific account. Fixed to match treatment_options schema (no description column, uses order_index).';
