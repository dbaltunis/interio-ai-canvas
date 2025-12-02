import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, FileText, Receipt, Bell } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const EMAIL_VARIABLES = [
  { variable: '{{client_name}}', description: 'Client full name' },
  { variable: '{{quote_number}}', description: 'Quote reference number' },
  { variable: '{{quote_total}}', description: 'Quote total amount' },
  { variable: '{{invoice_number}}', description: 'Invoice number' },
  { variable: '{{invoice_total}}', description: 'Invoice total' },
  { variable: '{{due_date}}', description: 'Payment due date' },
  { variable: '{{company_name}}', description: 'Your company name' },
];

const DEFAULT_TEMPLATES = {
  quote_sent: {
    subject: 'Your Quote from {{company_name}} - {{quote_number}}',
    body: `Dear {{client_name}},

Thank you for your enquiry. Please find attached your quote {{quote_number}} for the total amount of {{quote_total}}.

This quote is valid for 30 days from the date of issue.

If you have any questions, please don't hesitate to contact us.

Best regards,
{{company_name}}`,
  },
  invoice: {
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `Dear {{client_name}},

Please find attached invoice {{invoice_number}} for the total amount of {{invoice_total}}.

Payment is due by {{due_date}}.

Thank you for your business.

Best regards,
{{company_name}}`,
  },
  reminder: {
    subject: 'Payment Reminder - Invoice {{invoice_number}}',
    body: `Dear {{client_name}},

This is a friendly reminder that invoice {{invoice_number}} for {{invoice_total}} is due for payment on {{due_date}}.

If you have already made the payment, please disregard this message.

Best regards,
{{company_name}}`,
  },
};

export const EmailTemplatesStep = ({ data, updateSection }: StepProps) => {
  const templates = data.email_templates || {};

  const handleChange = (templateType: string, field: string, value: string) => {
    updateSection('email_templates', {
      ...templates,
      [templateType]: {
        ...(templates[templateType as keyof typeof templates] || {}),
        [field]: value,
      },
    });
  };

  const getTemplateValue = (templateType: string, field: string) => {
    const template = templates[templateType as keyof typeof templates];
    if (template && typeof template === 'object') {
      return (template as any)[field] || DEFAULT_TEMPLATES[templateType as keyof typeof DEFAULT_TEMPLATES]?.[field as 'subject' | 'body'] || '';
    }
    return DEFAULT_TEMPLATES[templateType as keyof typeof DEFAULT_TEMPLATES]?.[field as 'subject' | 'body'] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-medium mb-2">Variables</h4>
          <div className="flex flex-wrap gap-2">
            {EMAIL_VARIABLES.map((v) => (
              <code
                key={v.variable}
                className="text-xs bg-background px-2 py-1 rounded border cursor-help"
                title={v.description}
              >
                {v.variable}
              </code>
            ))}
          </div>
        </div>

        <Tabs defaultValue="quote_sent" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quote_sent" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quote
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoice
            </TabsTrigger>
            <TabsTrigger value="reminder" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminder
            </TabsTrigger>
          </TabsList>

          {['quote_sent', 'invoice', 'reminder'].map((templateType) => (
            <TabsContent key={templateType} value={templateType} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject..."
                  value={getTemplateValue(templateType, 'subject')}
                  onChange={(e) => handleChange(templateType, 'subject', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  placeholder="Email content..."
                  rows={10}
                  value={getTemplateValue(templateType, 'body')}
                  onChange={(e) => handleChange(templateType, 'body', e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
