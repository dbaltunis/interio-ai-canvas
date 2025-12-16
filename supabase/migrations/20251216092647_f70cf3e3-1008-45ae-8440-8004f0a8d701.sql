-- Add hidden_value_ids column to template_option_settings for per-template value filtering
ALTER TABLE template_option_settings 
ADD COLUMN IF NOT EXISTS hidden_value_ids uuid[] DEFAULT '{}';