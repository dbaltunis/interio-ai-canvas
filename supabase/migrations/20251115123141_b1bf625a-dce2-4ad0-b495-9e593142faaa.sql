-- Add hidden_by_user column to option_values table
ALTER TABLE option_values 
ADD COLUMN IF NOT EXISTS hidden_by_user BOOLEAN DEFAULT false;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_option_values_hidden 
ON option_values(hidden_by_user);