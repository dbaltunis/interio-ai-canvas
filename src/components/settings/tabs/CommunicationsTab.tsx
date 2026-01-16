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
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

export const CommunicationsTab = () => {
  const {
    hasSendGridIntegration
  } = useIntegrationStatus();
  const {
    integrations
  } = useIntegrations();

  // Check Twilio integration - validate credentials exist and are not placeholders
  const twilioIntegration = integrations.find(i => i.integration_type === 'twilio');
  const hasTwilioIntegration = twilioIntegration?.active === true && 
    twilioIntegration?.api_credentials?.account_sid && 
    twilioIntegration?.api_credentials?.account_sid !== '-' &&
    twilioIntegration?.api_credentials?.auth_token &&
    twilioIntegration?.api_credentials?.auth_token !== '-';

  // Check WhatsApp BYOA status
  const {
    data: whatsappSettings
  } = useQuery({
    queryKey: ['whatsapp-user-settings'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return null;
      const {
        data
      } = await supabase.from('whatsapp_user_settings').select('use_own_account, verified').eq('user_id', user.id).maybeSingle();
      return data;
    }
  });
  const hasOwnWhatsApp = whatsappSettings?.use_own_account && whatsappSettings?.verified;
  return <div className="space-y-6">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Communications</h3>
          <p className="text-sm text-muted-foreground">Configure email, SMS, and WhatsApp settings</p>
        </div>
        <SectionHelpButton sectionId="communications" />
      </div>

      {/* Quick Start Guide */}
      

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
            
            {/* WhatsApp - BYOA Only */}
            <div className={`flex items-center gap-3 p-3 border rounded-lg ${hasOwnWhatsApp ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className={`p-2 rounded-full ${hasOwnWhatsApp ? 'bg-green-100' : 'bg-amber-100'}`}>
                <MessageSquare className={`h-4 w-4 ${hasOwnWhatsApp ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasOwnWhatsApp ? 'Your Twilio connected' : 'Connect your Twilio account'}
                </p>
              </div>
              <Badge variant={hasOwnWhatsApp ? "default" : "outline"} className={`text-[10px] shrink-0 ${hasOwnWhatsApp ? 'bg-green-600' : 'border-amber-300 text-amber-700'}`}>
                {hasOwnWhatsApp ? 'Active' : 'Optional'}
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
    </div>;
};