-- Drop broken database functions that reference is_system_default column
DROP FUNCTION IF EXISTS public.create_comprehensive_blind_templates();
DROP FUNCTION IF EXISTS public.create_system_blind_templates();
DROP FUNCTION IF EXISTS public.seed_system_option_types();
DROP FUNCTION IF EXISTS public.seed_roller_blind_defaults();

-- Update orphaned templates with null/system user_id to belong to actual accounts
-- First, let's find if there are any templates with the zero UUID
-- If they exist, we'll need to either delete them or assign them to a real user
-- For now, we'll just delete orphaned templates as they're likely test data
DELETE FROM curtain_templates 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
  OR user_id IS NULL;