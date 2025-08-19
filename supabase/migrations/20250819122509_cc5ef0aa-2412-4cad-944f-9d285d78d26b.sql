-- Fix the parent_account_id issue that's preventing user deletion
-- Set correct parent_account_id for users who still have NULL values

UPDATE public.user_profiles 
SET parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d'::uuid,
    updated_at = now()
WHERE parent_account_id IS NULL 
    AND user_id != 'ec930f73-ef23-4430-921f-1b401859825d'::uuid;