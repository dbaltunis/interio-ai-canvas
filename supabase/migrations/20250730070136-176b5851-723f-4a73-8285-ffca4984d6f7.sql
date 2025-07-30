-- Add notification fields to appointments table to support the existing trigger
ALTER TABLE public.appointments 
ADD COLUMN notification_enabled BOOLEAN DEFAULT false,
ADD COLUMN notification_minutes INTEGER DEFAULT 15;