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
import { TutorialOverlay } from "./TutorialOverlay";
import { InteractiveOnboarding } from "./InteractiveOnboarding";
import { NotificationManagementTab } from "./tabs/NotificationManagementTab";
import { CommunicationsTab } from "./tabs/CommunicationsTab";
import { EnhancedPersonalizationTab } from "./tabs/EnhancedPersonalizationTab";
import { SecurityPrivacyTab } from "./tabs/SecurityPrivacyTab";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHasPermission } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { user } = useAuth();
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
  
  // Permission checks - following the same pattern as jobs
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[SettingsView] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if view_window_treatments is explicitly in user_permissions table
  const hasViewWindowTreatmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_window_treatments'
  ) ?? false;

  // Check if view_team_members is explicitly in user_permissions table
  const hasViewTeamMembersPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_team_members'
  ) ?? false;

  // Check if manage_business_settings is explicitly in user_permissions table
  const hasManageBusinessSettingsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_business_settings'
  ) ?? false;

  // Check if manage_integrations is explicitly in user_permissions table
  const hasManageIntegrationsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'manage_integrations'
  ) ?? false;

  // Check if view_profile is explicitly in user_permissions table
  const hasViewProfilePermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_profile'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow view if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include view_window_treatments)
  const canViewWindowTreatments =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasViewWindowTreatmentsPermission
          : hasViewWindowTreatmentsPermission;

  // Only allow view if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include view_team_members)
  const canViewTeamMembers =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasViewTeamMembersPermission
          : hasViewTeamMembersPermission;

  // Check manage_business_settings permission using the same pattern
  const canManageBusinessSettings = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasManageBusinessSettingsPermission
        : hasManageBusinessSettingsPermission;

  // Check manage_integrations permission using the same pattern
  const canManageIntegrations = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasManageIntegrationsPermission
        : hasManageIntegrationsPermission;

  // Check view_profile permission using the same pattern
  const canViewProfile = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewProfilePermission
        : hasViewProfilePermission;

  // Determine initial tab - location state takes precedence, but check permission
  const getInitialTab = () => {
    // Only allow window-coverings if user has permission
    if ((locationState?.createTemplate || locationState?.activeTab === 'templates' || locationState?.editTemplateId) 
        && canViewWindowTreatments && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      return "window-coverings";
    }
    // If personal tab is requested but user doesn't have permission, find first available tab
    if (tabParam === "personal" && !canViewProfile && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      // Try to find first available tab
      if (canManageBusinessSettings) return "business";
      if (canViewWindowTreatments) return "window-coverings";
      if (canManageIntegrations) return "integrations";
      if (canViewTeamMembers) return "users";
      // If no other tabs available, still show personal (they might have view_settings)
      return "personal";
    }
    // If business tab is requested but user doesn't have permission, default to first available
    if (tabParam === "business" && !canManageBusinessSettings && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      if (canViewProfile) return "personal";
      if (canViewWindowTreatments) return "window-coverings";
      if (canManageIntegrations) return "integrations";
      if (canViewTeamMembers) return "users";
      return "personal";
    }
    // If integrations tab is requested but user doesn't have permission, default to first available
    if (tabParam === "integrations" && !canManageIntegrations && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      if (canViewProfile) return "personal";
      if (canManageBusinessSettings) return "business";
      if (canViewWindowTreatments) return "window-coverings";
      if (canViewTeamMembers) return "users";
      return "personal";
    }
    // If no tab specified and user doesn't have view_profile, find first available tab
    if (!tabParam && !canViewProfile && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      if (canManageBusinessSettings) return "business";
      if (canViewWindowTreatments) return "window-coverings";
      if (canManageIntegrations) return "integrations";
      if (canViewTeamMembers) return "users";
      // Fallback to personal even if no permission (they might have view_settings)
      return "personal";
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

  // Redirect away from window-coverings tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "window-coverings" && !canViewWindowTreatments && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setActiveTab("personal");
    }
  }, [activeTab, canViewWindowTreatments, permissionsLoading, roleLoading, explicitPermissions]);

  // Redirect away from users tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "users" && !canViewTeamMembers && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setActiveTab("personal");
    }
  }, [activeTab, canViewTeamMembers, permissionsLoading, roleLoading, explicitPermissions]);

  // Redirect away from business tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "business" && !canManageBusinessSettings && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setActiveTab("personal");
    }
  }, [activeTab, canManageBusinessSettings, permissionsLoading, roleLoading, explicitPermissions]);

  // Redirect away from integrations tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "integrations" && !canManageIntegrations && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      // Redirect to first available tab
      if (canViewProfile) setActiveTab("personal");
      else if (canManageBusinessSettings) setActiveTab("business");
      else if (canViewWindowTreatments) setActiveTab("window-coverings");
      else if (canViewTeamMembers) setActiveTab("users");
      else setActiveTab("personal");
    }
  }, [activeTab, canManageIntegrations, canViewProfile, canManageBusinessSettings, canViewWindowTreatments, canViewTeamMembers, permissionsLoading, roleLoading, explicitPermissions]);

  // Redirect away from personal tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "personal" && !canViewProfile && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      // Redirect to first available tab
      if (canManageBusinessSettings) setActiveTab("business");
      else if (canViewWindowTreatments) setActiveTab("window-coverings");
      else if (canManageIntegrations) setActiveTab("integrations");
      else if (canViewTeamMembers) setActiveTab("users");
      // If no other tabs available, keep personal (they might have view_settings)
    }
  }, [activeTab, canViewProfile, canManageBusinessSettings, canViewWindowTreatments, canManageIntegrations, canViewTeamMembers, permissionsLoading, roleLoading, explicitPermissions]);

  // Check if view_settings is explicitly in user_permissions table
  const hasViewSettingsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_settings'
  ) ?? false;

  // Works like jobs, clients, inventory, and emails:
  // - System Owner: always has access
  // - Owner/Admin: only bypass restrictions if NO explicit permissions exist in table at all
  //   If ANY explicit permissions exist, respect ALL settings (missing = disabled)
  // - Staff/Regular users: Always check explicit permissions
  const canViewSettings = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewSettingsPermission
        : hasViewSettingsPermission;

  // Permission checks - treat undefined (loading) as true to prevent UI flicker
  const canManageSettingsRaw = useHasPermission('manage_settings');
  const canManageTeamRaw = useHasPermission('manage_team');
  
  // But dealers should never see these tabs (only apply restriction when we know they're a dealer)
  // CRITICAL: Hide tabs for dealers - check loading state to prevent flicker
  // While loading, hide restricted tabs (false is safer than showing then hiding)
  const isDealerOrLoading = isDealerLoading || isDealer === true;
  
  // During loading (undefined), show tabs to prevent disappearing UI
  // But dealers should never see these tabs - apply dealer check
  const canManageSettings = !isDealerOrLoading && canManageSettingsRaw !== false;
  const canManageTeam = !isDealerOrLoading && canManageTeamRaw !== false;
  const canManageMarkup = !isDealerOrLoading && canManageSettingsRaw !== false; // Only owners/admins can manage pricing
  const canViewBilling = !isDealerOrLoading; // Dealers don't see billing - hide during loading too
  const canViewNotifications = !isDealerOrLoading; // Dealers don't see notifications settings
  
  // Apply dealer check to existing permission variables (keep original for early return check)
  const canViewSettingsForTabs = !isDealerOrLoading && canViewSettings;
  const canViewWindowTreatmentsForTabs = !isDealerOrLoading && canViewWindowTreatments;

  // Don't render if user doesn't have permission (after permissions load)
  if (canViewSettings === false && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
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
            explicitPermissionsLoaded: explicitPermissions !== undefined,
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

        {canViewNotifications && <TabsContent value="notifications" className="animate-fade-in">
          <NotificationManagementTab />
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