import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Users, FileText, Globe, Bell, User, Building2, Calculator, MessageCircle } from "lucide-react";
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
import { CommunicationsTab } from "./tabs/CommunicationsTab";
import { EnhancedPersonalizationTab } from "./tabs/EnhancedPersonalizationTab";
import { SecurityPrivacyTab } from "./tabs/SecurityPrivacyTab";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHasPermission } from "@/hooks/usePermissions";
import { useLocation, useNavigate } from "react-router-dom";

interface CreateTemplateData {
  name: string;
  category: string;
  description: string;
  inventoryItemId: string;
}

interface LocationState {
  activeTab?: string;
  createTemplate?: CreateTemplateData;
  editTemplateId?: string;
}

export const SettingsView = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;

  // Read initial tab from URL parameters or location state
  // Support both ?tab= and ?section= for backward compatibility
  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab') || urlParams.get('section');
  
  // Determine initial tab - location state takes precedence
  const getInitialTab = () => {
    if (locationState?.createTemplate || locationState?.activeTab === 'templates' || locationState?.editTemplateId) {
      return "window-coverings";
    }
    return tabParam || "personal";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [createTemplateData, setCreateTemplateData] = useState<CreateTemplateData | null>(
    locationState?.createTemplate || null
  );
  const [editTemplateId, setEditTemplateId] = useState<string | null>(
    locationState?.editTemplateId || null
  );

  // Clear location state after reading to prevent re-triggering on refresh
  useEffect(() => {
    if (locationState) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  // Permission checks - treat undefined (loading) as true to prevent UI flicker
  const canViewSettingsRaw = useHasPermission('view_settings');
  const canManageSettingsRaw = useHasPermission('manage_settings');
  const canManageUsersRaw = useHasPermission('manage_users');
  const canViewWindowTreatmentsRaw = useHasPermission('view_window_treatments');
  
  // During loading (undefined), show tabs to prevent disappearing UI
  const canViewSettings = canViewSettingsRaw !== false;
  const canManageSettings = canManageSettingsRaw !== false;
  const canManageUsers = canManageUsersRaw !== false;
  const canViewWindowTreatments = canViewWindowTreatmentsRaw !== false;
  const canManageMarkup = canManageSettingsRaw !== false; // Only owners/admins can manage pricing

  return <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList variant="segment" className="p-1 h-auto bg-muted/40 flex flex-wrap gap-0.5 justify-start rounded-xl">
          <TabsTrigger value="personal" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          
          {/* HIDDEN: Billing tab - Not ready yet
          <TabsTrigger value="billing" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          */}
          
          {canViewSettings && <TabsTrigger value="business" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>}

          
          {canViewSettings && <TabsTrigger value="units" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Ruler className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>}
          
          {canViewWindowTreatments && <TabsTrigger value="window-coverings" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>}
          
          {canManageMarkup && <TabsTrigger value="pricing" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Markup & Tax</span>
            </TabsTrigger>}
          
          {canManageUsers && <TabsTrigger value="users" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="documents" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>}
          
          
          {canViewSettings && <TabsTrigger value="system" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="communications" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Communications</span>
            </TabsTrigger>}
          
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          
          {canViewSettings && <TabsTrigger value="integrations" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>}
        </TabsList>

        <TabsContent value="personal" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <PersonalSettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        {/* HIDDEN: Billing tab content - Not ready yet
        <TabsContent value="billing" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <BillingTab />
            </CardContent>
          </Card>
        </TabsContent>
        */}

        {canViewSettings && <TabsContent value="business" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <BusinessSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>}


        {canViewSettings && <TabsContent value="units" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <MeasurementUnitsTab />
              </CardContent>
            </Card>
          </TabsContent>}

        {canViewWindowTreatments && <TabsContent value="window-coverings" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <WindowCoveringsTab 
                  createTemplateData={createTemplateData}
                  onTemplateCreated={() => setCreateTemplateData(null)}
                  editTemplateId={editTemplateId}
                  onTemplateEdited={() => setEditTemplateId(null)}
                />
              </CardContent>
            </Card>
          </TabsContent>}

        {canManageMarkup && <TabsContent value="pricing" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <PricingRulesTab />
              </CardContent>
            </Card>
          </TabsContent>}

        {canManageUsers && <TabsContent value="users" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <UserManagementTab />
              </CardContent>
            </Card>
          </TabsContent>}

        {canViewSettings && <TabsContent value="documents" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <DocumentTemplatesTab />
              </CardContent>
            </Card>
          </TabsContent>}


        {canViewSettings && <TabsContent value="system" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <SystemSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>}

        {canViewSettings && <TabsContent value="communications" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <CommunicationsTab />
              </CardContent>
            </Card>
          </TabsContent>}

        <TabsContent value="notifications" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <NotificationManagementTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <SecurityPrivacyTab />
            </CardContent>
          </Card>
        </TabsContent>

        {canViewSettings && <TabsContent value="integrations" className="animate-fade-in">
            <Card variant="elevated" className="transition-shadow">
              <CardContent className="p-5 md:p-6">
                <IntegrationsTab />
              </CardContent>
            </Card>
          </TabsContent>}
      </Tabs>

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onTabChange={setActiveTab} />

      <InteractiveOnboarding isOpen={showInteractiveDemo} onClose={() => setShowInteractiveDemo(false)} />
    </div>;
};