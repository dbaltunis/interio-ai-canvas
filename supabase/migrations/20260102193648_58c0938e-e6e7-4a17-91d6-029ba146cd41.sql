-- Create WhatsApp templates table
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  twilio_template_sid TEXT,
  status TEXT DEFAULT 'draft',
  is_shared_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create WhatsApp message logs table  
CREATE TABLE public.whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_owner_id UUID NOT NULL,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  to_number TEXT NOT NULL,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  message_body TEXT,
  media_url TEXT,
  twilio_message_sid TEXT,
  status TEXT DEFAULT 'queued',
  status_updated_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for whatsapp_templates
CREATE POLICY "Users can view their account templates"
  ON public.whatsapp_templates FOR SELECT
  USING (account_owner_id = get_account_owner(auth.uid()) OR is_shared_template = true);

CREATE POLICY "Account owners can create templates"
  ON public.whatsapp_templates FOR INSERT
  WITH CHECK (account_owner_id = get_account_owner(auth.uid()));

CREATE POLICY "Account owners can update templates"
  ON public.whatsapp_templates FOR UPDATE
  USING (account_owner_id = get_account_owner(auth.uid()));

CREATE POLICY "Account owners can delete templates"
  ON public.whatsapp_templates FOR DELETE
  USING (account_owner_id = get_account_owner(auth.uid()));

-- RLS policies for whatsapp_message_logs
CREATE POLICY "Users can view their account message logs"
  ON public.whatsapp_message_logs FOR SELECT
  USING (account_owner_id = get_account_owner(auth.uid()));

CREATE POLICY "Users can create message logs"
  ON public.whatsapp_message_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() AND account_owner_id = get_account_owner(auth.uid()));

-- Update trigger for templates
CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add whatsapp feature to Enterprise plan (using name only)
UPDATE public.subscription_plans 
SET features_included = COALESCE(features_included, '{}'::jsonb) || '{"whatsapp": true}'::jsonb
WHERE name ILIKE '%enterprise%' OR name ILIKE '%professional%';

-- Insert shared default templates
INSERT INTO public.whatsapp_templates (account_owner_id, name, template_type, content, variables, status, is_shared_template)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Appointment Reminder', 'appointment_reminder', 
   'Hi {{client_name}}, this is a reminder about your appointment on {{date}} at {{time}}. Reply CONFIRM to confirm or call us to reschedule.',
   '["client_name", "date", "time"]'::jsonb, 'approved', true),
  ('00000000-0000-0000-0000-000000000000', 'Quote Ready', 'quote_notification',
   'Hi {{client_name}}, your quote #{{quote_number}} is ready! Total: {{total}}. Questions? Reply to this message.',
   '["client_name", "quote_number", "total"]'::jsonb, 'approved', true),
  ('00000000-0000-0000-0000-000000000000', 'Project Update', 'project_update',
   'Hi {{client_name}}, update on your project: {{update_message}}. Questions? Reply to this message.',
   '["client_name", "update_message"]'::jsonb, 'approved', true),
  ('00000000-0000-0000-0000-000000000000', 'Thank You', 'thank_you',
   'Thank you for choosing us, {{client_name}}! We hope you love your new {{product}}. How would you rate our service? Reply 1-5',
   '["client_name", "product"]'::jsonb, 'approved', true);

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_templates_account ON public.whatsapp_templates(account_owner_id);
CREATE INDEX idx_whatsapp_message_logs_account ON public.whatsapp_message_logs(account_owner_id);
CREATE INDEX idx_whatsapp_message_logs_client ON public.whatsapp_message_logs(client_id);
CREATE INDEX idx_whatsapp_message_logs_status ON public.whatsapp_message_logs(status);