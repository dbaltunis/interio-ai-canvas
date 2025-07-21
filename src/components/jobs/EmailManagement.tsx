
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Settings, BarChart3, Send, History } from "lucide-react";
import { EmailDashboard } from "./email/EmailDashboard";
import { EmailComposer } from "./email/EmailComposer";
import { EmailCampaigns } from "./email/EmailCampaigns";
import { EmailAnalytics } from "./email/EmailAnalytics";
import { EmailSettings } from "./email/EmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";

export const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showComposer, setShowComposer] = useState(false);
  const { hasSendGridIntegration } = useIntegrationStatus();

  if (!hasSendGridIntegration) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Email Integration Required</h3>
              <p className="text-gray-500 mb-4">
                Please configure your email integration to start sending emails.
              </p>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Email Integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showComposer) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6">
          <EmailComposer onClose={() => setShowComposer(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Email Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your email campaigns and communications
            </p>
          </div>
          <Button 
            onClick={() => setShowComposer(true)}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>

        {/* Email Management Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-gray-50 px-4 py-2">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="dashboard" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  <History className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="dashboard" className="mt-0 space-y-0">
                <EmailDashboard />
              </TabsContent>

              <TabsContent value="campaigns" className="mt-0 space-y-0">
                <EmailCampaigns />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 space-y-0">
                <EmailAnalytics />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-0">
                <EmailSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
