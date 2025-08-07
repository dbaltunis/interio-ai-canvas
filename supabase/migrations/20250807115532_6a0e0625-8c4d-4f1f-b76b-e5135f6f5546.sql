-- Fix remaining security issues from linter

-- Fix function search path for sanitize_text_input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove potential XSS patterns
  input_text := regexp_replace(input_text, '<[^>]*>', '', 'g');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Limit length
  IF length(input_text) > 10000 THEN
    input_text := substring(input_text from 1 for 10000);
  END IF;
  
  RETURN trim(input_text);
END;
$$;