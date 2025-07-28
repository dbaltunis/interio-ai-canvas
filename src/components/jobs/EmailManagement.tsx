
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, Plus, Settings, BarChart3, Filter, ChevronDown } from "lucide-react";
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
  const [showComposer, setShowComposer] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { hasSendGridIntegration, isLoading: integrationLoading } = useIntegrationStatus();
  const { data: emailSettings } = useEmailSettings();
  const { data: emails = [] } = useEmails();

  const handleEmailSettingsClick = () => {
    setShowSettings(true);
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

  if (showComposer) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6">
          <EmailComposer onClose={() => setShowComposer(false)} />
        </div>
      </div>
    );
  }

  if (showCampaigns) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Emails
                <span className="text-lg font-normal text-gray-500">
                  ({emails?.length || 0})
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-gray-300 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="border-gray-300 p-2"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-brand-primary hover:bg-brand-accent text-white"
                    disabled={!hasSendGridIntegration || !emailSettings}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compose Email
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowComposer(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Compose Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCampaigns(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Go to Campaigns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <EmailCampaigns />
          <Button 
            onClick={() => setShowCampaigns(false)}
            variant="outline"
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Emails
                <span className="text-lg font-normal text-gray-500">
                  ({emails?.length || 0})
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-gray-300 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="border-gray-300 p-2"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-brand-primary hover:bg-brand-accent text-white"
                    disabled={!hasSendGridIntegration || !emailSettings}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compose Email
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowComposer(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Compose Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCampaigns(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Go to Campaigns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <EmailAnalytics />
          <Button 
            onClick={() => setShowAnalytics(false)}
            variant="outline"
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Emails
                <span className="text-lg font-normal text-gray-500">
                  ({emails?.length || 0})
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-gray-300 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="border-gray-300 p-2"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-brand-primary hover:bg-brand-accent text-white"
                    disabled={!hasSendGridIntegration || !emailSettings}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compose Email
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowComposer(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Compose Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCampaigns(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Go to Campaigns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <EmailSettings />
          <Button 
            onClick={() => setShowSettings(false)}
            variant="outline"
            className="mt-4"
          >
            Back to Dashboard
          </Button>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Emails
              <span className="text-lg font-normal text-gray-500">
                ({emails?.length || 0})
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300 px-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="border-gray-300 p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowAnalytics(true)}
              className="border-gray-300 p-2"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-brand-primary hover:bg-brand-accent text-white"
                  disabled={!hasSendGridIntegration || !emailSettings}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compose Email
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowComposer(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Compose Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCampaigns(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Go to Campaigns
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Integration Status Banners */}
        <EmailIntegrationBanners
          hasSendGridIntegration={hasSendGridIntegration}
          hasEmailSettings={!!emailSettings}
          onEmailSettingsClick={handleEmailSettingsClick}
        />

        {/* Dashboard Content */}
        <EmailDashboard showFilters={showFilters} setShowFilters={setShowFilters} />
      </div>
    </div>
  );
};

export default EmailManagement;
