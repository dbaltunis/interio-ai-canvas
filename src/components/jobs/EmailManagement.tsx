
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, Plus, Settings, BarChart3, Filter, ChevronDown, ArrowLeft, Home } from "lucide-react";
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

  const handleBackToDashboard = () => {
    setShowComposer(false);
    setShowCampaigns(false);
    setShowAnalytics(false);
    setShowSettings(false);
  };

  const getCurrentViewTitle = () => {
    if (showComposer) return "Compose Email";
    if (showCampaigns) return "Email Campaigns";
    if (showAnalytics) return "Email Analytics";
    if (showSettings) return "Email Settings";
    return "Email Dashboard";
  };

  const isInSubView = showComposer || showCampaigns || showAnalytics || showSettings;

  // Show loading while checking integration status
  if (integrationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-brand-neutral">Loading email management...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Enhanced Header with Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Navigation */}
              {isInSubView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {/* Breadcrumb-style navigation */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="p-0 h-auto text-gray-600 hover:text-brand-primary"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                {isInSubView && (
                  <>
                    <span>/</span>
                    <span className="text-brand-primary font-medium">{getCurrentViewTitle()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Title and Email Count */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
                {getCurrentViewTitle()}
                <span className="text-lg font-normal text-gray-500">
                  ({emails?.length || 0})
                </span>
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isInSubView && (
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className={`border-gray-300 p-2 ${showSettings ? 'bg-gray-100' : ''}`}
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`border-gray-300 p-2 ${showAnalytics ? 'bg-gray-100' : ''}`}
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
                    Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                  <DropdownMenuItem onClick={() => setShowComposer(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Compose Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCampaigns(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Campaigns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {!isInSubView && (
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
          )}

          {/* Conditional Views */}
          {showComposer && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <EmailComposer onClose={() => setShowComposer(false)} />
            </div>
          )}

          {showCampaigns && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <EmailCampaigns />
            </div>
          )}

          {showAnalytics && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <EmailAnalytics />
            </div>
          )}

          {showSettings && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <EmailSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
