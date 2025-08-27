
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Settings, BarChart3, Filter, ChevronDown, Home, Send } from "lucide-react";
import { EmailDashboard } from "./email/EmailDashboard";
import { EmailComposer } from "./email/EmailComposer";
import { EmailCampaigns } from "./email/EmailCampaigns";
import { EmailAnalytics } from "./email/EmailAnalytics";
import { EmailSettings } from "./email/EmailSettings";
import { EmailIntegrationBanners } from "./email-components/EmailIntegrationBanners";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { useEmails } from "@/hooks/useEmails";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";

export const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { hasSendGridIntegration, isLoading: integrationLoading } = useIntegrationStatus();
  const { data: emailSettings } = useEmailSettings();
  const { data: emails = [] } = useEmails();

  const handleEmailSettingsClick = () => {
    setActiveTab("settings");
  };

  // Show loading while checking integration status
  if (integrationLoading) {
    return (
      <div className="w-full animate-fade-in">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="text-lg text-muted-foreground">Loading email management...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-light rounded-lg">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-default">Email Management</h1>
            <HelpIcon onClick={() => setShowHelp(true)} />
          </div>
          <Badge className="bg-accent-light text-accent border-accent">
            {emails?.length || 0} emails
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === "dashboard" && (
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-surface border-default text-default hover:bg-muted rounded-md"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          
          <Button 
            onClick={() => setActiveTab("composer")}
            className="bg-primary text-white hover:bg-primary-600 rounded-md"
            disabled={!hasSendGridIntegration || !emailSettings}
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>
      
      {/* Enhanced Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="composer" 
            className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Write</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Camps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "composer":
        return (
          <Card className="bg-surface border-default rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailComposer onClose={() => setActiveTab("dashboard")} />
            </CardContent>
          </Card>
        );
      case "campaigns":
        return (
          <Card className="bg-surface border-default rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailCampaigns />
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card className="bg-surface border-default rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailAnalytics />
            </CardContent>
          </Card>
        );
      case "settings":
        return (
          <Card className="bg-surface border-default rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailSettings />
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Integration Status Banners */}
            <EmailIntegrationBanners
              hasSendGridIntegration={hasSendGridIntegration}
              hasEmailSettings={!!emailSettings}
              onEmailSettingsClick={handleEmailSettingsClick}
            />
            
            {/* Dashboard Content */}
            <EmailDashboard showFilters={showFilters} setShowFilters={setShowFilters} />
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full px-6 py-6 space-y-8">
        {renderHeader()}
        {renderContent()}
      </div>
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Email Management"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Create, send, and track email communications with clients. Manage email campaigns, analyze performance metrics, and configure email settings."
          },
          actions: {
            title: "Common actions",
            content: "Compose emails, create campaigns, view analytics, manage email templates, configure SendGrid settings, and track email performance."
          },
          tips: {
            title: "Tips & best practices",
            content: "Use personalized subject lines. Keep emails concise and professional. Monitor open and click rates. Set up email templates for common communications."
          },
          shortcuts: [
            { key: "Ctrl + M", description: "Compose new email" },
            { key: "Ctrl + S", description: "Save draft" },
            { key: "Tab", description: "Switch between sections" }
          ]
        }}
      />
    </div>
  );
};

export default EmailManagement;
