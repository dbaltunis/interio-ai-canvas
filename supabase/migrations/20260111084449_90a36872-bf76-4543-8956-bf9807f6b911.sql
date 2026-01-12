-- Add Dealer role to app_role enum
-- This must be committed before it can be used in functions
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'Dealer';