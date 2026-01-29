-- Fix get_next_sequence_number to prevent LPAD truncation
-- and add preview_next_sequence_number for read-only previews

-- Drop and recreate the function with LPAD fix
CREATE OR REPLACE FUNCTION public.get_next_sequence_number(
  p_user_id UUID,
  p_entity_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_current_number INTEGER;
  v_padding INTEGER;
  v_result TEXT;
  v_effective_padding INTEGER;
BEGIN
  -- Update and get the next number in one atomic operation
  UPDATE number_sequences
  SET next_number = next_number + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND entity_type = p_entity_type
    AND active = TRUE
  RETURNING prefix, next_number - 1, padding INTO v_prefix, v_current_number, v_padding;

  -- If no sequence found, create default and return first number
  IF v_prefix IS NULL THEN
    -- Determine default prefix
    v_prefix := CASE p_entity_type
      WHEN 'job' THEN 'JOB-'
      WHEN 'quote' THEN 'QT-'
      WHEN 'invoice' THEN 'INV-'
      WHEN 'order' THEN 'ORD-'
      WHEN 'draft' THEN 'DFT-'
      ELSE 'DOC-'
    END;
    
    INSERT INTO number_sequences (user_id, entity_type, prefix, next_number, padding, active)
    VALUES (p_user_id, p_entity_type, v_prefix, 2, 4, TRUE)
    ON CONFLICT (user_id, entity_type) 
    DO UPDATE SET next_number = number_sequences.next_number + 1, updated_at = NOW()
    RETURNING prefix, next_number - 1, padding INTO v_prefix, v_current_number, v_padding;
  END IF;

  -- FIX: Use GREATEST to ensure padding is at least as long as the number
  -- This prevents truncation when number exceeds padding length
  v_effective_padding := GREATEST(v_padding, LENGTH(v_current_number::TEXT));
  v_result := v_prefix || LPAD(v_current_number::TEXT, v_effective_padding, '0');
  
  RETURN v_result;
END;
$$;

-- Create preview function that shows next number WITHOUT incrementing
CREATE OR REPLACE FUNCTION public.preview_next_sequence_number(
  p_user_id UUID,
  p_entity_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_next_number INTEGER;
  v_padding INTEGER;
  v_effective_padding INTEGER;
BEGIN
  -- Get current sequence info WITHOUT modifying it
  SELECT prefix, next_number, padding 
  INTO v_prefix, v_next_number, v_padding
  FROM number_sequences
  WHERE user_id = p_user_id
    AND entity_type = p_entity_type
    AND active = TRUE
  LIMIT 1;

  -- If no sequence found, return preview of what first number would be
  IF v_prefix IS NULL THEN
    v_prefix := CASE p_entity_type
      WHEN 'job' THEN 'JOB-'
      WHEN 'quote' THEN 'QT-'
      WHEN 'invoice' THEN 'INV-'
      WHEN 'order' THEN 'ORD-'
      WHEN 'draft' THEN 'DFT-'
      ELSE 'DOC-'
    END;
    v_next_number := 1;
    v_padding := 4;
  END IF;

  -- Use GREATEST to prevent truncation
  v_effective_padding := GREATEST(v_padding, LENGTH(v_next_number::TEXT));
  
  RETURN v_prefix || LPAD(v_next_number::TEXT, v_effective_padding, '0');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.preview_next_sequence_number(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_sequence_number(UUID, TEXT) TO authenticated;