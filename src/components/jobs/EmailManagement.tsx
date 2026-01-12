import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, MessageSquare, Shield, Send, Users, Filter } from "lucide-react";
import { EmailDashboard } from "./email/EmailDashboard";
import { EmailComposer } from "./email/EmailComposer";
import { EmailCampaigns } from "./email/EmailCampaigns";
import { EmailAnalytics } from "./email/EmailAnalytics";
import { EmailSettings } from "./email/EmailSettings";
import { EmailIntegrationBanners } from "./email-components/EmailIntegrationBanners";
import { WhatsAppMessageHistory } from "@/components/messaging/WhatsAppMessageHistory";
import { useEmailSetupStatus } from "@/hooks/useIntegrationStatus";
import { useEmails } from "@/hooks/useEmails";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanSendEmails } from "@/hooks/useCanSendEmails";
import { useToast } from "@/hooks/use-toast";

export const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const canAccessEmails = useHasPermission('view_jobs');
  const [showHelp, setShowHelp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { hasEmailSettings, isLoading: integrationLoading } = useEmailSetupStatus();
  const { data: emails = [] } = useEmails();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canSendEmails, isPermissionLoaded } = useCanSendEmails();

  if (canAccessEmails === undefined) {
    return (
      <div className="w-full animate-fade-in">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="text-lg text-muted-foreground">Loading permissions...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessEmails) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Access Denied</h3>
              <p className="text-muted-foreground text-sm mt-1">
                You don't have permission to access messages. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEmailSettingsClick = () => {
    setActiveTab("settings");
  };

  if (integrationLoading) {
    return (
      <div className="w-full animate-fade-in">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="text-lg text-muted-foreground">Loading messages...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          <HelpIcon onClick={() => setShowHelp(true)} />
          <Badge variant="secondary" className="text-xs">
            {emails?.length || 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "messages" && (
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          
          <div className="relative group">
            <Button 
              onClick={() => {
                if (!isPermissionLoaded || !canSendEmails) {
                  toast({
                    title: "Permission Denied",
                    description: "You don't have permission to send emails.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!hasEmailSettings) {
                  toast({
                    title: "Email Settings Required",
                    description: "Please configure your sender name and email in Settings first.",
                    variant: "destructive",
                  });
                  return;
                }
                setActiveTab("composer");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasEmailSettings || !isPermissionLoaded || !canSendEmails}
            >
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
            {(!hasEmailSettings || !isPermissionLoaded || !canSendEmails) && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                <div className="bg-popover text-popover-foreground text-xs rounded-md p-2 shadow-lg border whitespace-nowrap">
                  {!isPermissionLoaded || !canSendEmails 
                    ? "You don't have permission to send emails."
                    : "Configure your sender email in Settings first"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          <TabsTrigger 
            value="messages" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Mail className="w-4 h-4" />
            All Messages
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Users className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "composer":
        return (
          <Card className="bg-card border-border rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailComposer onClose={() => setActiveTab("messages")} />
            </CardContent>
          </Card>
        );
      case "campaigns":
        return (
          <div className="space-y-6 animate-fade-in">
            <EmailCampaigns />
          </div>
        );
      case "analytics":
        return (
          <Card className="bg-card border-border rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailAnalytics />
            </CardContent>
          </Card>
        );
      case "whatsapp":
        return (
          <Card className="bg-card border-border rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <WhatsAppMessageHistory />
            </CardContent>
          </Card>
        );
      case "settings":
        return (
          <Card className="bg-card border-border rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailSettings />
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <EmailIntegrationBanners onEmailSettingsClick={handleEmailSettingsClick} />
            <EmailAnalytics />
            <EmailDashboard showFilters={showFilters} setShowFilters={setShowFilters} />
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="w-full px-6 py-6 space-y-6">
        {renderHeader()}
        {renderContent()}
      </div>
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Messages"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Send and track email and WhatsApp communications with clients. Create campaigns for bulk outreach and monitor message performance."
          },
          actions: {
            title: "Common actions",
            content: "Compose new messages, view message history, create bulk campaigns, and configure sender settings."
          },
          tips: {
            title: "Tips & best practices",
            content: "Use personalized subject lines. Keep messages concise and professional. Monitor open and click rates to improve engagement."
          },
          shortcuts: [
            { key: "Ctrl + M", description: "Compose new message" },
            { key: "Tab", description: "Switch between sections" }
          ]
        }}
      />
    </div>
  );
};

export default EmailManagement;
