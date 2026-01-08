-- Insert lead_initial_contact template for all existing users who have email_templates
-- Using WHERE NOT EXISTS to avoid duplicates since no unique constraint exists
INSERT INTO public.email_templates (user_id, template_type, subject, content, variables, active)
SELECT DISTINCT 
  et.user_id,
  'lead_initial_contact',
  'Introduction from {{company.name}}',
  'Dear {{client.name}},

Thank you for your interest in {{company.name}}! We specialise in professional window treatment solutions and would love to help with your project.

I''d like to learn more about your requirements and discuss how we can assist you. Would you be available for a brief consultation?

Please feel free to reply to this email or call us at {{company.phone}} to schedule a convenient time.

{{sender.signature}}',
  '["client.name", "client.email", "company.name", "company.phone", "company.email", "sender.name", "sender.signature"]'::jsonb,
  true
FROM public.email_templates et
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates et2 
  WHERE et2.user_id = et.user_id 
  AND et2.template_type = 'lead_initial_contact'
);