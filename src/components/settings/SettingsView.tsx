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
      {/* Settings Header - Compact like Jobs page */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Clean underline tabs - no ugly segment/pill roundness */}
        <TabsList className="flex flex-wrap gap-0 border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger value="personal" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          
          {canViewSettings && <TabsTrigger value="business" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>}

          {canViewSettings && <TabsTrigger value="units" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>}
          
          {canViewWindowTreatments && <TabsTrigger value="window-coverings" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>}
          
          {canManageMarkup && <TabsTrigger value="pricing" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Markup & Tax</span>
            </TabsTrigger>}
          
          {canManageUsers && <TabsTrigger value="users" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="documents" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="system" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="communications" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Communications</span>
            </TabsTrigger>}
          
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          
          {canViewSettings && <TabsTrigger value="integrations" className="flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>}
        </TabsList>

        <TabsContent value="personal" className="animate-fade-in">
          <div className="settings-section">
            <PersonalSettingsTab />
          </div>
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
            <div className="settings-section">
              <BusinessSettingsTab />
            </div>
          </TabsContent>}

        {canViewSettings && <TabsContent value="units" className="animate-fade-in">
            <div className="settings-section">
              <MeasurementUnitsTab />
            </div>
          </TabsContent>}

        {canViewWindowTreatments && <TabsContent value="window-coverings" className="animate-fade-in">
            <div className="settings-section">
              <WindowCoveringsTab 
                createTemplateData={createTemplateData}
                onTemplateCreated={() => setCreateTemplateData(null)}
                editTemplateId={editTemplateId}
                onTemplateEdited={() => setEditTemplateId(null)}
              />
            </div>
          </TabsContent>}

        {canManageMarkup && <TabsContent value="pricing" className="animate-fade-in">
            <div className="settings-section">
              <PricingRulesTab />
            </div>
          </TabsContent>}

        {canManageUsers && <TabsContent value="users" className="animate-fade-in">
            <div className="settings-section">
              <UserManagementTab />
            </div>
          </TabsContent>}

        {canViewSettings && <TabsContent value="documents" className="animate-fade-in">
            <div className="settings-section">
              <DocumentTemplatesTab />
            </div>
          </TabsContent>}


        {canViewSettings && <TabsContent value="system" className="animate-fade-in">
            <div className="settings-section">
              <SystemSettingsTab />
            </div>
          </TabsContent>}

        {canViewSettings && <TabsContent value="communications" className="animate-fade-in">
            <div className="settings-section">
              <CommunicationsTab />
            </div>
          </TabsContent>}

        <TabsContent value="notifications" className="animate-fade-in">
          <div className="settings-section">
            <NotificationManagementTab />
          </div>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <div className="settings-section">
            <SecurityPrivacyTab />
          </div>
        </TabsContent>

        {canViewSettings && <TabsContent value="integrations" className="animate-fade-in">
            <div className="settings-section">
              <IntegrationsTab />
            </div>
          </TabsContent>}
      </Tabs>

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onTabChange={setActiveTab} />

      <InteractiveOnboarding isOpen={showInteractiveDemo} onClose={() => setShowInteractiveDemo(false)} />
    </div>;
};