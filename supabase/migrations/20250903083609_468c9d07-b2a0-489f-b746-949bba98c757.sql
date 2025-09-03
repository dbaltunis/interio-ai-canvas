-- Create only the essential new tables for notifications
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  category TEXT NOT NULL CHECK (category IN ('appointment_reminder', 'follow_up', 'project_update', 'custom')),
  subject TEXT, -- For email templates
  message TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables like {client_name}, {appointment_time}
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all_clients', 'team_members', 'selected_users')),
  recipient_ids UUID[] DEFAULT '{}'::UUID[], -- For selected users
  template_id UUID REFERENCES public.notification_templates(id),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  recipients_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own notification templates" ON public.notification_templates;
CREATE POLICY "Users can manage their own notification templates"
ON public.notification_templates
FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own broadcast notifications" ON public.broadcast_notifications;
CREATE POLICY "Users can manage their own broadcast notifications"
ON public.broadcast_notifications
FOR ALL
USING (auth.uid() = user_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON public.notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_broadcast_notifications_updated_at ON public.broadcast_notifications;
CREATE TRIGGER update_broadcast_notifications_updated_at
BEFORE UPDATE ON public.broadcast_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();