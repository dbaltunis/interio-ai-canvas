-- Add WhatsApp Cloud API (Meta direct) columns to whatsapp_user_settings
ALTER TABLE whatsapp_user_settings
  ADD COLUMN IF NOT EXISTS cloud_phone_number_id TEXT,
  ADD COLUMN IF NOT EXISTS cloud_access_token TEXT,
  ADD COLUMN IF NOT EXISTS cloud_business_account_id TEXT;
