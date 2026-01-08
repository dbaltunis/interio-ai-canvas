-- Add onboarding_completed flag to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Mark existing users as having completed onboarding (they've been using the app)
UPDATE public.user_profiles 
SET onboarding_completed = true 
WHERE created_at < NOW() - INTERVAL '1 hour';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether the user has completed the initial onboarding wizard (password change, company details, bank details)';