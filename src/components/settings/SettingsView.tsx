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
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;

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
  
  // During loading (undefined), show tabs to prevent disappearing UI
  const canManageSettings = canManageSettingsRaw !== false;
  const canManageTeam = canManageTeamRaw !== false;
  const canManageMarkup = canManageSettingsRaw !== false; // Only owners/admins can manage pricing

  // Don't render if user doesn't have permission (after permissions load)
  if (canViewSettings === false && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">You don't have permission to view settings.</p>
      </div>
    );
  }

  return <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b border-border h-auto flex flex-wrap gap-1 justify-start pb-0 rounded-none">
          <TabsTrigger 
            value="personal" 
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            disabled={!canViewProfile && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canViewProfile && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to view profile" : undefined}
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          
          {/* HIDDEN: Billing tab - Not ready yet
          <TabsTrigger value="billing" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          */}
          
          <TabsTrigger 
            value="business" 
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            disabled={!canManageBusinessSettings && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canManageBusinessSettings && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to manage business settings" : undefined}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>

          
          {canViewSettings && <TabsTrigger value="units" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Ruler className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>}
          
          <TabsTrigger 
            value="window-coverings" 
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            disabled={!canViewWindowTreatments && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canViewWindowTreatments && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to view products & templates" : undefined}
          >
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          
          {canManageMarkup && <TabsTrigger value="pricing" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Markup & Tax</span>
            </TabsTrigger>}
          
          {(canManageTeam || canViewTeamMembers) && <TabsTrigger 
            value="users" 
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            disabled={!canViewTeamMembers && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canViewTeamMembers && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to view team members" : undefined}
          >
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
          
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="integrations" 
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            disabled={!canManageIntegrations && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canManageIntegrations && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to manage integrations" : undefined}
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {canViewProfile && (
          <TabsContent value="personal" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <PersonalSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* HIDDEN: Billing tab content - Not ready yet
        <TabsContent value="billing" className="animate-fade-in">
          <Card variant="elevated" className="transition-shadow">
            <CardContent className="p-5 md:p-6">
              <BillingTab />
            </CardContent>
          </Card>
        </TabsContent>
        */}

        {canManageBusinessSettings && (
          <TabsContent value="business" className="animate-fade-in">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <BusinessSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}


        {canViewSettings && <TabsContent value="units" className="animate-fade-in">
            <MeasurementUnitsTab />
          </TabsContent>}

        {canViewWindowTreatments && (
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

        {canViewSettings && <TabsContent value="documents" className="animate-fade-in">
            <DocumentTemplatesTab />
          </TabsContent>}

        {canViewSettings && <TabsContent value="system" className="animate-fade-in">
            <SystemSettingsTab />
          </TabsContent>}

        {canViewSettings && <TabsContent value="communications" className="animate-fade-in">
            <CommunicationsTab />
          </TabsContent>}

        <TabsContent value="notifications" className="animate-fade-in">
          <NotificationManagementTab />
        </TabsContent>

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