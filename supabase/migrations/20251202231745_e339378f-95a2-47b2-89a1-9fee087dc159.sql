-- Add status_automations column to onboarding_progress table
ALTER TABLE public.onboarding_progress 
ADD COLUMN IF NOT EXISTS status_automations JSONB DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN public.onboarding_progress.status_automations IS 'Stores job status configurations and automation settings for the account';