
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Layers, Play, Users, FileText, Globe, Shield, Bell, User, Building2, CreditCard, Calculator, Sparkles } from "lucide-react";
import { PersonalSettingsTab } from "./tabs/PersonalSettingsTab";
import { BusinessSettingsTab } from "./tabs/BusinessSettingsTab";
import { BillingTab } from "./tabs/BillingTab";
import { WindowCoveringsTab } from "./tabs/WindowCoveringsTab";
import { TreatmentsManagementTab } from "./tabs/TreatmentsManagementTab";

import { MeasurementUnitsTab } from "./tabs/MeasurementUnitsTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { DocumentTemplatesTab } from "./tabs/DocumentTemplatesTab";
import { SystemSettingsTab } from "./tabs/SystemSettingsTab";
import { PricingRulesTab } from "./tabs/PricingRulesTab";
import { TutorialOverlay } from "./TutorialOverlay";
import { InteractiveOnboarding } from "./InteractiveOnboarding";
import { NotificationManagementTab } from "./tabs/NotificationManagementTab";
import { EnhancedPersonalizationTab } from "./tabs/EnhancedPersonalizationTab";
import { SecurityPrivacyTab } from "./tabs/SecurityPrivacyTab";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHasPermission } from "@/hooks/usePermissions";

export const SettingsView = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  
  // Read initial tab from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section');
  const [activeTab, setActiveTab] = useState(sectionParam || "personal");

  // Permission checks
  const canViewSettings = useHasPermission('view_settings');
  const canManageSettings = useHasPermission('manage_settings');
  const canManageUsers = useHasPermission('manage_users');
  const canViewWindowTreatments = useHasPermission('view_window_treatments');
  const canManageMarkup = useHasPermission('manage_settings'); // Only owners/admins can manage pricing

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shrink-0">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h2>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Configure your personal preferences and business settings
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowInteractiveDemo(true)}
            variant="outline"
            size="sm"
            className="hover-lift interactive-bounce flex-1 sm:flex-initial"
          >
            <Play className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">Interactive Demo</span>
          </Button>
          <Button 
            onClick={() => setShowTutorial(true)}
            size="sm"
            className="hover-lift interactive-bounce shadow-lg flex-1 sm:flex-initial"
          >
            <Zap className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">Setup Guide</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="modern-card p-1 h-auto bg-muted/30 backdrop-blur-sm flex flex-wrap gap-1 justify-start">
          <TabsTrigger value="personal" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Personal</span>
          </TabsTrigger>
          
          <TabsTrigger value="billing" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Billing</span>
          </TabsTrigger>
          
          {canViewSettings && (
            <TabsTrigger value="business" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Business</span>
            </TabsTrigger>
          )}

          
          {canViewSettings && (
            <TabsTrigger value="units" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Units</span>
            </TabsTrigger>
          )}
          
          {canViewWindowTreatments && (
            <TabsTrigger value="window-coverings" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Products</span>
            </TabsTrigger>
          )}
          
          {canManageMarkup && (
            <TabsTrigger value="pricing" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Markup & Tax</span>
            </TabsTrigger>
          )}
          
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Team</span>
            </TabsTrigger>
          )}
          
          {canViewSettings && (
            <TabsTrigger value="documents" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Documents</span>
            </TabsTrigger>
          )}
          
          
          {canViewSettings && (
            <TabsTrigger value="system" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">System</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="notifications" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Alerts</span>
          </TabsTrigger>
          
          {canViewSettings && (
            <TabsTrigger value="integrations" className="flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Integrations</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personal" className="animate-fade-in">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <PersonalSettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="animate-fade-in">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <BillingTab />
            </CardContent>
          </Card>
        </TabsContent>

        {canViewSettings && (
          <TabsContent value="business" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <BusinessSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}


        {canViewSettings && (
          <TabsContent value="units" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <MeasurementUnitsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewWindowTreatments && (
          <TabsContent value="window-coverings" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <WindowCoveringsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageMarkup && (
          <TabsContent value="pricing" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <PricingRulesTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageUsers && (
          <TabsContent value="users" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <UserManagementTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewSettings && (
          <TabsContent value="documents" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <DocumentTemplatesTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}


        {canViewSettings && (
          <TabsContent value="system" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <SystemSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <NotificationManagementTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <SecurityPrivacyTab />
            </CardContent>
          </Card>
        </TabsContent>

        {canViewSettings && (
          <TabsContent value="integrations" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <IntegrationsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <TutorialOverlay 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onTabChange={setActiveTab}
      />

      <InteractiveOnboarding
        isOpen={showInteractiveDemo}
        onClose={() => setShowInteractiveDemo(false)}
      />
    </div>
  );
};
