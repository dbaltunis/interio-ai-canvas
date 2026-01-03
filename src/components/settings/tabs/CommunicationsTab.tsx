import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Settings2 } from "lucide-react";
import { EmailSettingsTab } from "../EmailSettingsTab";
import { WhatsAppTemplateManager } from "@/components/messaging/WhatsAppTemplateManager";
import { WhatsAppBYOASetup } from "@/components/messaging/WhatsAppBYOASetup";
import { TwilioIntegrationTab } from "@/components/integrations/TwilioIntegrationTab";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CommunicationsTab = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();
  const { integrations } = useIntegrations();
  
  // Check Twilio integration
  const twilioIntegration = integrations.find(i => i.integration_type === 'twilio');
  const hasTwilioIntegration = twilioIntegration?.active === true;

  // Check WhatsApp BYOA status
  const { data: whatsappSettings } = useQuery({
    queryKey: ['whatsapp-user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('whatsapp_user_settings')
        .select('use_own_account, verified')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    }
  });

  const hasOwnWhatsApp = whatsappSettings?.use_own_account && whatsappSettings?.verified;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Communications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you communicate with clients via email, SMS, and WhatsApp
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Start Guide</CardTitle>
          <CardDescription>Where to find and use each communication channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Email</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Client profiles → Quick Actions → Email, or Email Management page
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">SMS</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasTwilioIntegration 
                  ? 'Client profiles → Quick Actions → SMS'
                  : 'Setup Twilio below, then use from Client profiles'}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">WhatsApp</span>
                <Badge variant="default" className="text-[10px] bg-green-600">Ready</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Client profiles → Quick Actions → WhatsApp, or Job pages → Contact button
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Communication Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email - Shared or Custom */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${hasSendGridIntegration ? 'bg-green-100' : 'bg-muted'}`}>
                <Mail className={`h-4 w-4 ${hasSendGridIntegration ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Email</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasSendGridIntegration ? 'Your SendGrid account' : 'Shared service'}
                </p>
              </div>
              <Badge variant={hasSendGridIntegration ? "default" : "secondary"} className="text-[10px] shrink-0">
                {hasSendGridIntegration ? 'Custom' : 'Included'}
              </Badge>
            </div>
            
            {/* SMS - Optional BYOA */}
            <div className={`flex items-center gap-3 p-3 border rounded-lg ${hasTwilioIntegration ? '' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className={`p-2 rounded-full ${hasTwilioIntegration ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Phone className={`h-4 w-4 ${hasTwilioIntegration ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">SMS</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasTwilioIntegration ? 'Your Twilio connected' : 'Optional — add your Twilio'}
                </p>
              </div>
              <Badge variant={hasTwilioIntegration ? "default" : "outline"} className={`text-[10px] shrink-0 ${!hasTwilioIntegration ? 'border-amber-300 text-amber-700' : ''}`}>
                {hasTwilioIntegration ? 'Active' : 'Optional'}
              </Badge>
            </div>
            
            {/* WhatsApp - Included or BYOA */}
            <div className="flex items-center gap-3 p-3 border rounded-lg border-green-200 bg-green-50/50">
              <div className="p-2 rounded-full bg-green-100">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasOwnWhatsApp ? 'Your own number connected' : 'Ready to use — shared number'}
                </p>
              </div>
              <Badge variant="default" className={`text-[10px] shrink-0 ${hasOwnWhatsApp ? 'bg-blue-600' : 'bg-green-600'}`}>
                {hasOwnWhatsApp ? 'BYOA' : 'Included'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings Tabs */}
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">SMS</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="mt-6">
          <EmailSettingsTab />
        </TabsContent>
        
        <TabsContent value="sms" className="mt-6">
          <TwilioIntegrationTab />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-6">
          <WhatsAppBYOASetup />
          <WhatsAppTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
