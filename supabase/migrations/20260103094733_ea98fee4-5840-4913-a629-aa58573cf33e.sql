-- Fix race condition in get_next_sequence_number by using atomic UPDATE ... RETURNING
CREATE OR REPLACE FUNCTION public.get_next_sequence_number(p_user_id uuid, p_entity_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix TEXT;
  v_current_number INTEGER;
  v_padding INTEGER;
  v_result TEXT;
BEGIN
  -- Atomic increment and return in a single statement
  -- This prevents race conditions by combining SELECT and UPDATE
  UPDATE number_sequences
  SET next_number = next_number + 1,
      updated_at = now()
  WHERE user_id = p_user_id 
    AND entity_type = p_entity_type 
    AND active = true
  RETURNING prefix, next_number - 1, padding
  INTO v_prefix, v_current_number, v_padding;
  
  -- If no sequence exists, return NULL (caller should handle this)
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Generate the formatted number using the number BEFORE increment
  v_result := v_prefix || LPAD(v_current_number::TEXT, v_padding, '0');
  
  RETURN v_result;
END;
$function$;