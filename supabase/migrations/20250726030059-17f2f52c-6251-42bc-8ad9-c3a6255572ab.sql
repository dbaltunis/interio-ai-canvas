-- Add missing fields to appointments table for enhanced functionality
ALTER TABLE public.appointments 
ADD COLUMN color text,
ADD COLUMN video_meeting_link text,
ADD COLUMN team_member_ids uuid[],
ADD COLUMN invited_client_emails text[];