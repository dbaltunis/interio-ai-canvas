-- Add account_status column to user_profiles for blocking accounts
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'blocked', 'trial_ended', 'suspended'));

-- Add blocked_reason column to explain why account is blocked
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS blocked_reason text;

-- Add blocked_at timestamp
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone;

-- Create index for quick lookup of blocked accounts
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON public.user_profiles(account_status);

-- Update RLS policy to allow System Owners to update account_status
-- (Existing policies should already cover this via role checks)