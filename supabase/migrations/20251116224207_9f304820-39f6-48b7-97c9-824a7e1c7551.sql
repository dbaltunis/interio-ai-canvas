-- Add System Owner role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'System Owner';