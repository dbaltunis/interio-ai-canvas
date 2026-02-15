import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsGroupedNavigation } from "./SettingsGroupedNavigation";
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
import { ServicesSettingsTab } from "./tabs/ServicesSettingsTab";
import { TutorialOverlay } from "./TutorialOverlay";
import { InteractiveOnboarding } from "./InteractiveOnboarding";

import { CommunicationsTab } from "./tabs/CommunicationsTab";
import { EnhancedPersonalizationTab } from "./tabs/EnhancedPersonalizationTab";
import { SecurityPrivacyTab } from "./tabs/SecurityPrivacyTab";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
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
  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab') || urlParams.get('section');

  // Role check for dealer gating only
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();

  // === PERMISSION CHECKS ===
  // useHasPermission already merges role defaults + custom permissions correctly.
  // Owner/Admin always has all permissions from ROLE_PERMISSIONS.
  // Custom permissions are ADDITIVE, never subtractive.
  // Returns undefined while loading, true/false when resolved.
  const hasViewSettings = useHasPermission('view_settings');
  const hasViewWindowTreatments = useHasPermission('view_window_treatments');
  const hasViewTeamMembers = useHasPermission('view_team_members');
  const hasManageBusinessSettings = useHasPermission('manage_business_settings');
  const hasManageIntegrations = useHasPermission('manage_integrations');
  const hasViewProfile = useHasPermission('view_profile');
  const hasManageSettings = useHasPermission('manage_settings');
  const hasManageTeam = useHasPermission('manage_team');

  const permissionsLoading = hasViewSettings === undefined;

  // Dealer gating — dealers only see personal tab
  const isDealerOrLoading = isDealerLoading || isDealer === true;

  // Permission booleans (true while loading to prevent flash)
  const canViewProfile = hasViewProfile !== false;
  const canViewWindowTreatments = !isDealerOrLoading && hasViewWindowTreatments !== false;
  const canViewTeamMembers = !isDealerOrLoading && hasViewTeamMembers !== false;
  const canManageBusinessSettings = !isDealerOrLoading && hasManageBusinessSettings !== false;
  const canManageIntegrations = !isDealerOrLoading && hasManageIntegrations !== false;
  const canViewSettings = !isDealerOrLoading && hasViewSettings !== false;
  const canManageSettings = !isDealerOrLoading && hasManageSettings !== false;
  const canManageTeam = !isDealerOrLoading && hasManageTeam !== false;
  const canManageMarkup = canManageSettings;
  const canViewBilling = !isDealerOrLoading;
  const canViewNotifications = !isDealerOrLoading;
  const canViewSettingsForTabs = canViewSettings;
  const canViewWindowTreatmentsForTabs = canViewWindowTreatments;

  // Determine initial tab - location state takes precedence, but check permission
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

  // Sync activeTab with URL tab parameter changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newTabParam = urlParams.get('tab') || urlParams.get('section');
    if (newTabParam && newTabParam !== activeTab) {
      setActiveTab(newTabParam);
    }
  }, [location.search]);

  // Don't render if user doesn't have permission (after permissions load)
  if (hasViewSettings === false && !permissionsLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">You don't have permission to view settings.</p>
      </div>
    );
  }

  return <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <SettingsGroupedNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          permissions={{
            canViewProfile,
            canViewBilling,
            canManageBusinessSettings,
            canViewSettingsForTabs,
            canViewWindowTreatmentsForTabs,
            canManageMarkup,
            canViewTeamMembers,
            canManageTeam,
            canViewNotifications,
            canManageIntegrations,
            permissionsLoading,
            roleLoading,
            explicitPermissionsLoaded: !permissionsLoading,
          }}
        />

        {canViewProfile && (
          <TabsContent value="personal" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <PersonalSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewBilling && <TabsContent value="billing" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <BillingTab />
            </CardContent>
          </Card>
        </TabsContent>}

        {canManageBusinessSettings && (
          <TabsContent value="business" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <BusinessSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}


        {canViewSettingsForTabs && <TabsContent value="units" className="animate-fade-in">
            <MeasurementUnitsTab />
          </TabsContent>}

        {canViewWindowTreatmentsForTabs && (
          <TabsContent value="window-coverings" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <WindowCoveringsTab 
                  createTemplateData={createTemplateData}
                  onTemplateCreated={() => setCreateTemplateData(null)}
                  editTemplateId={editTemplateId}
                  onTemplateEdited={() => setEditTemplateId(null)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageMarkup && <TabsContent value="pricing" className="animate-fade-in">
            <PricingRulesTab />
          </TabsContent>}

        {canViewWindowTreatmentsForTabs && (
          <TabsContent value="services" className="animate-fade-in">
            <ServicesSettingsTab />
          </TabsContent>
        )}

        {canViewTeamMembers && (
          <TabsContent value="users" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <UserManagementTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewSettingsForTabs && <TabsContent value="documents" className="animate-fade-in">
            <DocumentTemplatesTab />
          </TabsContent>}

        {canViewSettingsForTabs && <TabsContent value="system" className="animate-fade-in">
            <SystemSettingsTab />
          </TabsContent>}

        {canViewSettingsForTabs && <TabsContent value="communications" className="animate-fade-in">
            <CommunicationsTab />
          </TabsContent>}


        <TabsContent value="security" className="animate-fade-in">
          <SecurityPrivacyTab />
        </TabsContent>

        {canManageIntegrations && (
          <TabsContent value="integrations" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <IntegrationsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onTabChange={setActiveTab} />

      <InteractiveOnboarding isOpen={showInteractiveDemo} onClose={() => setShowInteractiveDemo(false)} />
    </div>;
};