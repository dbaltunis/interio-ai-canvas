import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Settings2 } from "lucide-react";
import { EmailSettingsTab } from "../EmailSettingsTab";
import { WhatsAppTemplateManager } from "@/components/messaging/WhatsAppTemplateManager";
import { TwilioIntegrationTab } from "@/components/integrations/TwilioIntegrationTab";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useIntegrations } from "@/hooks/useIntegrations";

export const CommunicationsTab = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();
  const { integrations } = useIntegrations();
  
  // Check Twilio integration
  const twilioIntegration = integrations.find(i => i.integration_type === 'twilio');
  const hasTwilioIntegration = twilioIntegration?.active === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Communications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you communicate with clients via email, SMS, and WhatsApp
        </p>
      </div>

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
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${hasSendGridIntegration ? 'bg-green-100' : 'bg-muted'}`}>
                <Mail className={`h-4 w-4 ${hasSendGridIntegration ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Email</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasSendGridIntegration ? 'Custom SendGrid' : 'Shared service'}
                </p>
              </div>
              <Badge variant={hasSendGridIntegration ? "default" : "secondary"} className="text-[10px] shrink-0">
                {hasSendGridIntegration ? 'Custom' : 'Shared'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${hasTwilioIntegration ? 'bg-green-100' : 'bg-muted'}`}>
                <Phone className={`h-4 w-4 ${hasTwilioIntegration ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">SMS</p>
                <p className="text-xs text-muted-foreground truncate">
                  {hasTwilioIntegration ? 'Your Twilio' : 'Requires your Twilio'}
                </p>
              </div>
              <Badge variant={hasTwilioIntegration ? "default" : "outline"} className="text-[10px] shrink-0">
                {hasTwilioIntegration ? 'Active' : 'BYOA'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 rounded-full bg-green-100">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground truncate">
                  Shared InterioApp number
                </p>
              </div>
              <Badge variant="default" className="text-[10px] shrink-0">
                Active
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

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
