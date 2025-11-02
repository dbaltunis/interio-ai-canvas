-- Fix existing duplicate job numbers in the database
-- This migration identifies projects with duplicate job_numbers and renames them with a -COPY-X suffix

DO $$
DECLARE
  duplicate_record RECORD;
  copy_counter INTEGER;
  new_job_number TEXT;
BEGIN
  -- Find all groups of projects with duplicate job numbers
  FOR duplicate_record IN 
    SELECT job_number, array_agg(id ORDER BY created_at) as project_ids
    FROM projects
    WHERE job_number IS NOT NULL
    GROUP BY job_number
    HAVING COUNT(*) > 1
  LOOP
    copy_counter := 1;
    
    -- Skip the first (original) project, rename the rest
    FOREACH new_job_number IN ARRAY duplicate_record.project_ids[2:array_length(duplicate_record.project_ids, 1)]
    LOOP
      -- Generate new job number with COPY suffix
      UPDATE projects
      SET job_number = duplicate_record.job_number || '-COPY-' || copy_counter,
          updated_at = now()
      WHERE id = new_job_number::uuid;
      
      copy_counter := copy_counter + 1;
      
      RAISE NOTICE 'Fixed duplicate: % -> %', duplicate_record.job_number, duplicate_record.job_number || '-COPY-' || (copy_counter - 1);
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Duplicate job number cleanup completed';
END $$;

-- Create number_sequences table for managing sequential numbers
CREATE TABLE IF NOT EXISTS number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('draft', 'quote', 'order', 'invoice', 'job')),
  prefix TEXT NOT NULL DEFAULT '',
  next_number INTEGER NOT NULL DEFAULT 1,
  padding INTEGER NOT NULL DEFAULT 4 CHECK (padding >= 1 AND padding <= 10),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type)
);

-- Enable RLS on number_sequences
ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for number_sequences
CREATE POLICY "Users can view their own number sequences"
  ON number_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own number sequences"
  ON number_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own number sequences"
  ON number_sequences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own number sequences"
  ON number_sequences FOR DELETE
  USING (auth.uid() = user_id);

-- Function to atomically generate next number
CREATE OR REPLACE FUNCTION get_next_sequence_number(
  p_user_id UUID,
  p_entity_type TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_next_number INTEGER;
  v_padding INTEGER;
  v_result TEXT;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT prefix, next_number, padding
  INTO v_prefix, v_next_number, v_padding
  FROM number_sequences
  WHERE user_id = p_user_id AND entity_type = p_entity_type AND active = true
  FOR UPDATE;
  
  -- If no sequence exists, return NULL (caller should handle this)
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Generate the formatted number
  v_result := v_prefix || LPAD(v_next_number::TEXT, v_padding, '0');
  
  -- Increment for next time
  UPDATE number_sequences
  SET next_number = next_number + 1,
      updated_at = now()
  WHERE user_id = p_user_id AND entity_type = p_entity_type;
  
  RETURN v_result;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_number_sequences_updated_at
  BEFORE UPDATE ON number_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE number_sequences IS 'Manages sequential number generation for different entity types (drafts, quotes, orders, invoices, jobs)';
COMMENT ON FUNCTION get_next_sequence_number IS 'Atomically generates and returns the next sequential number for a given entity type';