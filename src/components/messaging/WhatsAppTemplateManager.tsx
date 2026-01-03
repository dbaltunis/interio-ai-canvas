import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, Clock, CheckCircle, AlertCircle, ExternalLink, PartyPopper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: templates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    enabled: true,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .or(`account_owner_id.eq.${user.id},is_shared_template.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhatsAppTemplate[];
    },
  });

  // Default templates that are always available (pre-approved by Twilio)
  const defaultTemplates = [
    {
      id: 'default-appointment',
      name: 'Appointment Reminder',
      template_type: 'appointment_reminder',
      content: 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply CONFIRM to confirm or call us to reschedule.',
      variables: ['client_name', 'date', 'time'],
      status: 'approved',
      is_shared_template: true,
    },
    {
      id: 'default-quote',
      name: 'Quote Ready',
      template_type: 'quote_notification',
      content: 'Hi {{1}}, your quote #{{2}} is ready! Total: {{3}}. View it here: {{4}}',
      variables: ['client_name', 'quote_number', 'total', 'link'],
      status: 'approved',
      is_shared_template: true,
    },
    {
      id: 'default-project',
      name: 'Project Update',
      template_type: 'project_update',
      content: 'Hi {{1}}, update on your project: {{2}}. Questions? Reply to this message.',
      variables: ['client_name', 'update_message'],
      status: 'approved',
      is_shared_template: true,
    },
    {
      id: 'default-thankyou',
      name: 'Thank You',
      template_type: 'thank_you',
      content: 'Thank you for choosing {{1}}! We hope you love your new {{2}}. How would you rate our service? Reply 1-5',
      variables: ['company_name', 'product_description'],
      status: 'approved',
      is_shared_template: true,
    },
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
      custom: 'Custom',
    };
    return <Badge variant="outline">{types[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Included Feature Banner */}
      <Alert className="border-green-200 bg-green-50">
        <PartyPopper className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">WhatsApp Messaging is Included</AlertTitle>
        <AlertDescription className="text-green-700">
          No setup required — start messaging clients immediately! Messages are sent from the shared InterioApp WhatsApp Business number at no additional cost.
        </AlertDescription>
      </Alert>

      {/* WhatsApp Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                WhatsApp Business Messaging
              </CardTitle>
              <CardDescription>
                Send WhatsApp messages to clients using pre-approved templates
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready to Use
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sender Number Explanation */}
          <div className="p-4 border-2 border-green-300 bg-green-50 rounded-lg">
            <h4 className="font-medium text-sm text-green-800 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              How Messages Are Sent
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  📱
                </div>
                <div>
                  <p className="font-medium text-sm text-green-900">Messages sent from: InterioApp Business Number</p>
                  <p className="text-xs text-green-700 mt-1">
                    Your clients will receive messages from our verified WhatsApp Business account. 
                    The message will include your company name.
                  </p>
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                <strong>Want to use your own number?</strong> Contact support to upgrade to Enterprise BYOA (Bring Your Own Account) with your own Twilio WhatsApp number.
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">WhatsApp Business Rules</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Template Messages:</strong> Pre-approved templates can be sent anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span><strong>24-Hour Window:</strong> Free-form messages only work if client replied within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span><strong>Media Support:</strong> Include images or documents with your messages</span>
              </li>
            </ul>
          </div>

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
                  <p className="text-xs text-muted-foreground">Go to Email Management → WhatsApp tab to see all sent messages</p>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Pre-approved message templates you can use to contact clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show default templates first */}
              {defaultTemplates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {getTypeBadge(template.template_type)}
                      {template.is_shared_template && (
                        <Badge variant="secondary" className="text-xs">Shared</Badge>
                      )}
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                    {template.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Variables:</span>
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {/* Show custom templates */}
              {templates && templates.filter(t => !t.is_shared_template).map((template) => (
                <div key={template.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {getTypeBadge(template.template_type)}
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Custom Template */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Templates</CardTitle>
          <CardDescription>
            Need a custom template? Contact our support team to request approval for new templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Request Custom Template
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Custom templates require approval from WhatsApp/Meta and may take 24-48 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
