
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
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-brand-neutral">Loading email management...</div>
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            {emails?.length || 0} emails
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === "dashboard" && (
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          
          <Button 
            onClick={() => setActiveTab("composer")}
            className="bg-brand-primary hover:bg-brand-accent text-white"
            disabled={!hasSendGridIntegration || !emailSettings}
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 p-1 bg-muted/30">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="composer" 
            className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Mail className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Write</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Camps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm lg:flex"
          >
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm lg:flex"
          >
            <Settings className="w-3 h-3 md:w-4 md:h-4" />
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
          <div className="bg-white rounded-lg p-6">
            <EmailComposer onClose={() => setActiveTab("dashboard")} />
          </div>
        );
      case "campaigns":
        return (
          <div className="bg-white rounded-lg p-6">
            <EmailCampaigns />
          </div>
        );
      case "analytics":
        return (
          <div className="bg-white rounded-lg p-6">
            <EmailAnalytics />
          </div>
        );
      case "settings":
        return (
          <div className="bg-white rounded-lg p-6">
            <EmailSettings />
          </div>
        );
      default:
        return (
          <>
            {/* Integration Status Banners */}
            <EmailIntegrationBanners
              hasSendGridIntegration={hasSendGridIntegration}
              hasEmailSettings={!!emailSettings}
              onEmailSettingsClick={handleEmailSettingsClick}
            />
            
            {/* Dashboard Content */}
            <EmailDashboard showFilters={showFilters} setShowFilters={setShowFilters} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-6 py-6 space-y-6">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailManagement;
