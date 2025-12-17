-- First check if user_id is already a primary key
-- If not, add a unique constraint

-- Add primary key if not exists (user_id should be the primary key)
DO $$ 
BEGIN
  -- Check if there's already a primary key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_profiles'::regclass 
    AND contype = 'p'
  ) THEN
    ALTER TABLE public.user_profiles ADD PRIMARY KEY (user_id);
  ELSE
    -- If primary key exists but on different column, add unique constraint
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conrelid = 'public.user_profiles'::regclass 
      AND contype = 'u'
      AND conkey @> ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.user_profiles'::regclass AND attname = 'user_id')]
    ) THEN
      ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
    END IF;
  END IF;
END $$;