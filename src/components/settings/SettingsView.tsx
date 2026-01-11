import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Users, FileText, Globe, Bell, User, Building2, Calculator, MessageCircle, CreditCard } from "lucide-react";
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
import { useIsDealer } from "@/hooks/useIsDealer";

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

  // Check if current user is a Dealer
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();

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

  // Reset to personal tab if dealer tries to navigate elsewhere
  useEffect(() => {
    if (!isDealerLoading && isDealer && activeTab !== "personal") {
      setActiveTab("personal");
    }
  }, [isDealer, isDealerLoading, activeTab]);

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
  // But dealers should never see these tabs (only apply restriction when we know they're a dealer)
  const isDealerConfirmed = !isDealerLoading && isDealer === true;
  const canViewSettings = !isDealerConfirmed && canViewSettingsRaw !== false;
  const canManageSettings = !isDealerConfirmed && canManageSettingsRaw !== false;
  const canManageUsers = !isDealerConfirmed && canManageUsersRaw !== false;
  const canViewWindowTreatments = !isDealerConfirmed && canViewWindowTreatmentsRaw !== false;
  const canManageMarkup = !isDealerConfirmed && canManageSettingsRaw !== false; // Only owners/admins can manage pricing
  const canViewBilling = !isDealerConfirmed; // Dealers don't see billing
  const canViewNotifications = !isDealerConfirmed; // Dealers don't see notifications settings

  return <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b border-border h-auto flex flex-wrap gap-1 justify-start pb-0 rounded-none">
          <TabsTrigger value="personal" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          
          {canViewBilling && <TabsTrigger value="billing" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="business" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>}

          
          {canViewSettings && <TabsTrigger value="units" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Ruler className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>}
          
          {canViewWindowTreatments && <TabsTrigger value="window-coverings" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>}
          
          {canManageMarkup && <TabsTrigger value="pricing" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Markup & Tax</span>
            </TabsTrigger>}
          
          {canManageUsers && <TabsTrigger value="users" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="documents" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>}
          
          
          {canViewSettings && <TabsTrigger value="system" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="communications" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Communications</span>
            </TabsTrigger>}
          
          {canViewNotifications && <TabsTrigger value="notifications" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>}
          
          {canViewSettings && <TabsTrigger value="integrations" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>}
        </TabsList>

        <TabsContent value="personal" className="animate-fade-in">
          <PersonalSettingsTab />
        </TabsContent>

        {canViewBilling && <TabsContent value="billing" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <BillingTab />
            </CardContent>
          </Card>
        </TabsContent>}

        {canViewSettings && <TabsContent value="business" className="animate-fade-in">
            <BusinessSettingsTab />
          </TabsContent>}


        {canViewSettings && <TabsContent value="units" className="animate-fade-in">
            <MeasurementUnitsTab />
          </TabsContent>}

        {canViewWindowTreatments && <TabsContent value="window-coverings" className="animate-fade-in">
            <WindowCoveringsTab 
              createTemplateData={createTemplateData}
              onTemplateCreated={() => setCreateTemplateData(null)}
              editTemplateId={editTemplateId}
              onTemplateEdited={() => setEditTemplateId(null)}
            />
          </TabsContent>}

        {canManageMarkup && <TabsContent value="pricing" className="animate-fade-in">
            <PricingRulesTab />
          </TabsContent>}

        {canManageUsers && <TabsContent value="users" className="animate-fade-in">
            <UserManagementTab />
          </TabsContent>}

        {canViewSettings && <TabsContent value="documents" className="animate-fade-in">
            <DocumentTemplatesTab />
          </TabsContent>}

        {canViewSettings && <TabsContent value="system" className="animate-fade-in">
            <SystemSettingsTab />
          </TabsContent>}

        {canViewSettings && <TabsContent value="communications" className="animate-fade-in">
            <CommunicationsTab />
          </TabsContent>}

        {canViewNotifications && <TabsContent value="notifications" className="animate-fade-in">
          <NotificationManagementTab />
        </TabsContent>}

        <TabsContent value="security" className="animate-fade-in">
          <SecurityPrivacyTab />
        </TabsContent>

        {canViewSettings && <TabsContent value="integrations" className="animate-fade-in">
            <IntegrationsTab />
          </TabsContent>}
      </Tabs>

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onTabChange={setActiveTab} />

      <InteractiveOnboarding isOpen={showInteractiveDemo} onClose={() => setShowInteractiveDemo(false)} />
    </div>;
};