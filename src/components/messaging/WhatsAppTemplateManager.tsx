import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppTemplate {
  id: string;
  name: string;
  template_type: string;
  content: string;
  variables: string[];
  status: string;
  is_shared_template: boolean;
  created_at: string;
}

export const WhatsAppTemplateManager = () => {
  // Check if user has BYOA configured
  const { data: whatsappSettings } = useQuery({
    queryKey: ['whatsapp-user-settings-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('whatsapp_user_settings')
        .select('use_own_account, verified, whatsapp_number')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    }
  });

  const hasOwnWhatsApp = whatsappSettings?.use_own_account && whatsappSettings?.verified;

  // Only show templates if BYOA is configured
  if (!hasOwnWhatsApp) {
    return null; // Don't show template manager until WhatsApp is configured
  }

  // Default templates that work with Twilio WhatsApp
  const defaultTemplates = [
    {
      id: 'default-appointment',
      name: 'Appointment Reminder',
      template_type: 'appointment_reminder',
      content: 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply CONFIRM to confirm or call us to reschedule.',
      variables: ['client_name', 'date', 'time'],
      status: 'approved',
    },
    {
      id: 'default-quote',
      name: 'Quote Ready',
      template_type: 'quote_notification',
      content: 'Hi {{1}}, your quote #{{2}} is ready! Total: {{3}}. View it here: {{4}}',
      variables: ['client_name', 'quote_number', 'total', 'link'],
      status: 'approved',
    },
    {
      id: 'default-project',
      name: 'Project Update',
      template_type: 'project_update',
      content: 'Hi {{1}}, update on your project: {{2}}. Questions? Reply to this message.',
      variables: ['client_name', 'update_message'],
      status: 'approved',
    },
    {
      id: 'default-thankyou',
      name: 'Thank You',
      template_type: 'thank_you',
      content: 'Thank you for choosing {{1}}! We hope you love your new {{2}}. How would you rate our service? Reply 1-5',
      variables: ['company_name', 'product_description'],
      status: 'approved',
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      appointment_reminder: 'Appointment',
      quote_notification: 'Quote',
      project_update: 'Project',
      thank_you: 'Thank You',
      custom: 'Custom'
    };
    return <Badge variant="outline">{types[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Connected Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                WhatsApp Connected
              </CardTitle>
              <CardDescription>
                Sending from: {whatsappSettings?.whatsapp_number || 'Your Twilio number'}
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Where to use WhatsApp */}
          <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Where to Send WhatsApp Messages</h4>
            <ul className="text-sm space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <span className="font-medium">From Client Profiles</span>
                  <p className="text-xs text-muted-foreground">Go to Clients → Select a client → Click "WhatsApp" in Quick Actions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <span className="font-medium">From Job Pages</span>
                  <p className="text-xs text-muted-foreground">Open any Job → Click "Contact" button → Choose WhatsApp</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <span className="font-medium">View Message History</span>
                  <p className="text-xs text-muted-foreground">Go to Communications Center → WhatsApp tab</p>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message Templates</CardTitle>
          <CardDescription>Pre-approved templates for common messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {defaultTemplates.map((template) => (
              <div key={template.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{template.name}</span>
                    {getTypeBadge(template.template_type)}
                  </div>
                  {getStatusBadge(template.status)}
                </div>
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {template.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
