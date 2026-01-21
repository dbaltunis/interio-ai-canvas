-- Add columns to persist email settings preferences
ALTER TABLE email_settings 
ADD COLUMN IF NOT EXISTS use_auto_signature BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true;