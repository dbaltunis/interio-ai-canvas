
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFilters, setShowFilters] = useState(false);
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
          <div className="p-3 bg-primary/10 rounded-xl">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Email Management</h1>
            <p className="text-muted-foreground">Manage your email communications and campaigns</p>
          </div>
          <div className="status-indicator status-info">
            {emails?.length || 0} emails
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === "dashboard" && (
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hover-lift interactive-bounce"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          
          <Button 
            onClick={() => setActiveTab("composer")}
            variant="default"
            className="hover-lift interactive-bounce"
            disabled={!hasSendGridIntegration || !emailSettings}
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>
      
      {/* Standardized Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 h-auto w-auto gap-1 rounded-lg">
          <TabsTrigger 
            value="dashboard" 
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-medium
              text-muted-foreground hover:text-foreground hover:bg-background/50
              flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="composer" 
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-medium
              text-muted-foreground hover:text-foreground hover:bg-background/50
              flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Write</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-medium
              text-muted-foreground hover:text-foreground hover:bg-background/50
              flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Camps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-medium
              text-muted-foreground hover:text-foreground hover:bg-background/50
              flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-medium
              text-muted-foreground hover:text-foreground hover:bg-background/50
              flex items-center gap-2"
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
          <div className="modern-card animate-fade-in">
            <CardContent className="p-6">
              <EmailComposer onClose={() => setActiveTab("dashboard")} />
            </CardContent>
          </div>
        );
      case "campaigns":
        return (
          <div className="modern-card animate-fade-in">
            <CardContent className="p-6">
              <EmailCampaigns />
            </CardContent>
          </div>
        );
      case "analytics":
        return (
          <div className="modern-card animate-fade-in">
            <CardContent className="p-6">
              <EmailAnalytics />
            </CardContent>
          </div>
        );
      case "settings":
        return (
          <div className="modern-card animate-fade-in">
            <CardContent className="p-6">
              <EmailSettings />
            </CardContent>
          </div>
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
    </div>
  );
};

export default EmailManagement;
