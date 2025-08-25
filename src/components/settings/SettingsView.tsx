
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Layers, Play, Users, FileText, Globe, Shield, Bell, User, Building2, CreditCard, Calculator } from "lucide-react";
import { PersonalSettingsTab } from "./tabs/PersonalSettingsTab";
import { BusinessSettingsTab } from "./tabs/BusinessSettingsTab";
import { BillingTab } from "./tabs/BillingTab";
import { WindowCoveringsTab } from "./tabs/WindowCoveringsTab";
import { MeasurementUnitsTab } from "./tabs/MeasurementUnitsTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { DocumentTemplatesTab } from "./tabs/DocumentTemplatesTab";
import { SystemSettingsTab } from "./tabs/SystemSettingsTab";
import { PricingRulesTab } from "./tabs/PricingRulesTab";
import { AccountManagementTab } from "./tabs/AccountManagementTab";
import { TutorialOverlay } from "./TutorialOverlay";
import { InteractiveOnboarding } from "./InteractiveOnboarding";
import { EnhancedNotificationSettings } from "./EnhancedNotificationSettings";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useHasPermission } from "@/hooks/usePermissions";

export const SettingsView = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Permission checks
  const canViewSettings = useHasPermission('view_settings');
  const canManageSettings = useHasPermission('manage_settings');
  const canManageUsers = useHasPermission('manage_users');
  const canViewWindowTreatments = useHasPermission('view_window_treatments');
  const canManageMarkup = useHasPermission('manage_settings'); // Only owners/admins can manage pricing

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Settings</h2>
          <p className="text-brand-neutral">
            Configure your personal preferences and business settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowInteractiveDemo(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Interactive Demo
          </Button>
          <Button 
            onClick={() => setShowTutorial(true)}
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            Setup Guide
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-12 text-xs">
          <TabsTrigger value="personal" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          
          <TabsTrigger value="billing" className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          
          {canViewSettings && (
            <TabsTrigger value="business" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
          )}

          {canManageUsers && (
            <TabsTrigger value="account" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          )}
          
          {canViewSettings && (
            <TabsTrigger value="units" className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>
          )}
          
          {canViewWindowTreatments && (
            <TabsTrigger value="window-coverings" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
          )}
          
          {canManageMarkup && (
            <TabsTrigger value="pricing" className="flex items-center gap-1">
              <Calculator className="h-3 w-3" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
          )}
          
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          )}
          
          {canViewSettings && (
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          )}
          
          {canViewSettings && (
            <TabsTrigger value="system" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          
          {canViewSettings && (
            <TabsTrigger value="integrations" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettingsTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>

        {canViewSettings && (
          <TabsContent value="business">
            <BusinessSettingsTab />
          </TabsContent>
        )}

        {canManageUsers && (
          <TabsContent value="account">
            <AccountManagementTab />
          </TabsContent>
        )}

        {canViewSettings && (
          <TabsContent value="units">
            <MeasurementUnitsTab />
          </TabsContent>
        )}

        {canViewWindowTreatments && (
          <TabsContent value="window-coverings">
            <WindowCoveringsTab />
          </TabsContent>
        )}

        {canManageMarkup && (
          <TabsContent value="pricing">
            <PricingRulesTab />
          </TabsContent>
        )}

        {canManageUsers && (
          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>
        )}

        {canViewSettings && (
          <TabsContent value="documents">
            <DocumentTemplatesTab />
          </TabsContent>
        )}

        {canViewSettings && (
          <TabsContent value="system">
            <SystemSettingsTab />
          </TabsContent>
        )}

        <TabsContent value="notifications">
          <EnhancedNotificationSettings />
        </TabsContent>

        {canViewSettings && (
          <TabsContent value="integrations">
            <IntegrationsTab />
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
