-- Create SMS campaigns table
CREATE TABLE public.sms_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS templates table
CREATE TABLE public.sms_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS contacts table
CREATE TABLE public.sms_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  name TEXT,
  opted_in BOOLEAN DEFAULT true,
  opted_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opted_out_at TIMESTAMP WITH TIME ZONE,
  client_id UUID, -- Link to clients table if applicable
  tags TEXT[], -- For segmentation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Create SMS delivery logs table
CREATE TABLE public.sms_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID,
  template_id UUID,
  contact_id UUID,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'bounced')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for SMS campaigns
CREATE POLICY "Users can create their own SMS campaigns" ON public.sms_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS campaigns" ON public.sms_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS campaigns" ON public.sms_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMS campaigns" ON public.sms_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for SMS templates
CREATE POLICY "Users can create their own SMS templates" ON public.sms_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS templates" ON public.sms_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS templates" ON public.sms_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMS templates" ON public.sms_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for SMS contacts
CREATE POLICY "Users can create their own SMS contacts" ON public.sms_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS contacts" ON public.sms_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS contacts" ON public.sms_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMS contacts" ON public.sms_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for SMS delivery logs
CREATE POLICY "Users can view SMS logs for their campaigns" ON public.sms_delivery_logs
  FOR SELECT USING (
    campaign_id IN (SELECT id FROM public.sms_campaigns WHERE user_id = auth.uid()) OR
    template_id IN (SELECT id FROM public.sms_templates WHERE user_id = auth.uid()) OR
    contact_id IN (SELECT id FROM public.sms_contacts WHERE user_id = auth.uid())
  );

-- Add triggers for updated_at columns
CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON public.sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON public.sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sms_contacts_updated_at
  BEFORE UPDATE ON public.sms_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();