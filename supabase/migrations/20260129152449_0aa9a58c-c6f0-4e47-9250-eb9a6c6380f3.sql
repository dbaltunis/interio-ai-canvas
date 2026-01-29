-- Phase 1: Notification System Schema Enhancement

-- 1.1 Add new columns to notifications table for advanced features
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS source_type TEXT; -- 'project', 'appointment', 'quote', 'team', 'system'
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS group_key TEXT; -- For deduplication/grouping
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.notifications(id); -- For threading

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON public.notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_group_key 
ON public.notifications(group_key) WHERE group_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_source 
ON public.notifications(source_type, source_id) WHERE source_type IS NOT NULL;

-- 1.2 Create notification_preferences table for user settings
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  -- Digest preferences  
  digest_frequency TEXT DEFAULT 'never', -- 'never', 'daily', 'weekly'
  digest_day TEXT DEFAULT 'monday', -- For weekly digest
  digest_time TIME DEFAULT '09:00',
  -- Category preferences (JSONB for flexibility)
  category_preferences JSONB DEFAULT '{"project": true, "appointment": true, "quote": true, "team": true, "system": true}',
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- 1.3 Create notification_mentions table for @mentions and team collaboration
CREATE TABLE IF NOT EXISTS public.notification_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  mentioned_by_user_id UUID NOT NULL,
  context_type TEXT NOT NULL, -- 'project_note', 'comment', 'task'
  context_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for notification_mentions
CREATE INDEX IF NOT EXISTS idx_notification_mentions_user 
ON public.notification_mentions(mentioned_user_id, read);

CREATE INDEX IF NOT EXISTS idx_notification_mentions_notification 
ON public.notification_mentions(notification_id);

-- Enable RLS on notification_mentions
ALTER TABLE public.notification_mentions ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_mentions
CREATE POLICY "Users can view mentions directed at them"
ON public.notification_mentions FOR SELECT
USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Users can update their own mention read status"
ON public.notification_mentions FOR UPDATE
USING (auth.uid() = mentioned_user_id);

-- Allow authenticated users to insert mentions (when they mention others)
CREATE POLICY "Authenticated users can create mentions"
ON public.notification_mentions FOR INSERT
WITH CHECK (auth.uid() = mentioned_by_user_id);

-- Create function to update updated_at timestamp for notification_preferences
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification_preferences updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();

-- Create a function to check for duplicate notifications before insert
CREATE OR REPLACE FUNCTION public.check_notification_duplicate()
RETURNS TRIGGER AS $$
BEGIN
  -- If group_key is set, check for existing unread notification with same group_key
  IF NEW.group_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.notifications 
      WHERE group_key = NEW.group_key 
        AND user_id = NEW.user_id 
        AND read = false
        AND created_at > (now() - interval '24 hours')
    ) THEN
      -- Skip insert by returning NULL
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deduplication
DROP TRIGGER IF EXISTS check_notification_duplicate_trigger ON public.notifications;
CREATE TRIGGER check_notification_duplicate_trigger
  BEFORE INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_notification_duplicate();