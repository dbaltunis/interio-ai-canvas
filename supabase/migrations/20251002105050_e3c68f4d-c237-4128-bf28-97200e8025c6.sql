-- Add B2B-specific fields to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS abn TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT;