
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Zap, CreditCard, MessageSquare, Calendar, Package, Building, Database } from "lucide-react";
import { SendGridIntegrationTab } from "./SendGridIntegrationTab";
import { GoogleCalendarTab } from "./GoogleCalendarTab";
import { TIGPIMIntegrationTab } from "@/components/integrations/TIGPIMIntegrationTab";
import { MYOBExoIntegrationTab } from "@/components/integrations/MYOBExoIntegrationTab";
import { RFMSIntegrationTab } from "@/components/integrations/RFMSIntegrationTab";
import { TwilioIntegrationTab } from "@/components/integrations/TwilioIntegrationTab";
import { useIntegrations } from "@/hooks/useIntegrations";

export const IntegrationsTab = () => {
  const { integrations } = useIntegrations();
  
  const getIntegrationByType = (type: string) => 
    integrations.find(integration => integration.integration_type === type);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your business with external services and APIs
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="pim" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            PIM
          </TabsTrigger>
          <TabsTrigger value="erp" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            ERP
          </TabsTrigger>
          <TabsTrigger value="rfms" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            RFMS
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <SendGridIntegrationTab />
        </TabsContent>

        <TabsContent value="calendar">
          <GoogleCalendarTab />
        </TabsContent>

        <TabsContent value="pim">
          <TIGPIMIntegrationTab integration={getIntegrationByType('tig_pim') as any} />
        </TabsContent>

        <TabsContent value="erp">
          <MYOBExoIntegrationTab integration={getIntegrationByType('myob_exo') as any} />
        </TabsContent>

        <TabsContent value="rfms">
          <RFMSIntegrationTab integration={getIntegrationByType('rfms') as any} />
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Integrations</CardTitle>
              <CardDescription>
                Connect with automation platforms like Zapier, Make, and others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Automation integrations coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>
                Connect with Stripe, PayPal, and other payment processors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Payment integrations coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <TwilioIntegrationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
