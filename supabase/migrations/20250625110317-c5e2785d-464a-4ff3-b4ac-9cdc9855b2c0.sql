
-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'completed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'custom' CHECK (template_type IN ('quote_followup', 'installation_reminder', 'thank_you', 'promotional', 'custom')),
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emails table for tracking individual emails
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.email_campaigns(id),
  template_id UUID REFERENCES public.email_templates(id),
  client_id UUID REFERENCES public.clients(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  bounce_reason TEXT,
  sendgrid_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email analytics table for detailed tracking
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Email campaigns policies
CREATE POLICY "Users can view their own email campaigns" ON public.email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own email campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own email campaigns" ON public.email_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own email campaigns" ON public.email_campaigns FOR DELETE USING (auth.uid() = user_id);

-- Email templates policies
CREATE POLICY "Users can view their own email templates" ON public.email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own email templates" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own email templates" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own email templates" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- Emails policies
CREATE POLICY "Users can view their own emails" ON public.emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own emails" ON public.emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emails" ON public.emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emails" ON public.emails FOR DELETE USING (auth.uid() = user_id);

-- Email analytics policies
CREATE POLICY "Users can view email analytics for their emails" ON public.email_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.emails WHERE emails.id = email_analytics.email_id AND emails.user_id = auth.uid())
);
CREATE POLICY "Users can create email analytics for their emails" ON public.email_analytics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.emails WHERE emails.id = email_analytics.email_id AND emails.user_id = auth.uid())
);

-- Add updated_at triggers
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_campaign_id ON public.emails(campaign_id);
CREATE INDEX idx_emails_client_id ON public.emails(client_id);
CREATE INDEX idx_emails_status ON public.emails(status);
CREATE INDEX idx_emails_sent_at ON public.emails(sent_at);
CREATE INDEX idx_email_analytics_email_id ON public.email_analytics(email_id);
CREATE INDEX idx_email_analytics_event_type ON public.email_analytics(event_type);
