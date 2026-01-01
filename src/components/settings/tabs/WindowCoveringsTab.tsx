import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { OptionsArchitectureGuide } from "./components/OptionsArchitectureGuide";
import { TWCLibraryBrowser } from "@/components/integrations/TWCLibraryBrowser";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Layers, Settings, Sliders, HelpCircle, Truck } from "lucide-react";

interface CreateTemplateData {
  name: string;
  category: string;
  description: string;
  inventoryItemId: string;
}

interface WindowCoveringsTabProps {
  createTemplateData?: CreateTemplateData | null;
  onTemplateCreated?: () => void;
  editTemplateId?: string | null;
  onTemplateEdited?: () => void;
}

export const WindowCoveringsTab = ({ 
  createTemplateData, 
  onTemplateCreated,
  editTemplateId,
  onTemplateEdited
}: WindowCoveringsTabProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(createTemplateData || editTemplateId ? "templates" : "templates");
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<string | null>(null);
  
  // Check if TWC integration is enabled
  const { integrations } = useIntegrations();
  const hasTWCIntegration = integrations?.some(
    (i) => i.integration_type === 'twc' && i.active
  );

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
        console.error('[WindowCoveringsTab] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if view_templates is explicitly in user_permissions table
  const hasViewTemplatesPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_templates'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow view if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include view_templates)
  const canViewTemplates =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasViewTemplatesPermission
          : hasViewTemplatesPermission;

  // Auto-switch to templates tab when createTemplateData or editTemplateId is provided
  // Only switch if user has permission
  useEffect(() => {
    if ((createTemplateData || editTemplateId) && canViewTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setActiveTab("templates");
    }
  }, [createTemplateData, editTemplateId, canViewTemplates, permissionsLoading, roleLoading, explicitPermissions]);

  // Redirect away from templates tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === "templates" && !canViewTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      // Switch to the first available tab
      if (hasTWCIntegration) {
        setActiveTab("suppliers");
      } else {
        setActiveTab("headings");
      }
    }
  }, [activeTab, canViewTemplates, permissionsLoading, roleLoading, explicitPermissions, hasTWCIntegration]);

  const handleTemplateCloned = (templateId: string) => {
    // Only switch to templates tab if user has permission
    if (canViewTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined) {
      setActiveTab("templates");
      setHighlightedTemplateId(templateId);
      
      // Clear highlight after animation
      setTimeout(() => setHighlightedTemplateId(null), 3000);
    }
  };

  // Dynamic grid columns based on TWC integration
  const tabCount = hasTWCIntegration ? 6 : 5;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${tabCount === 6 ? 'grid-cols-6' : 'grid-cols-5'}`}>
              <TabsTrigger 
                value="templates" 
                className="data-[state=active]:bg-primary/10"
                disabled={!canViewTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
                title={!canViewTemplates && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to view templates" : undefined}
              >
                <Layers className="h-4 w-4 mr-2" />
                My Templates
              </TabsTrigger>
              {hasTWCIntegration && (
                <TabsTrigger value="suppliers" className="data-[state=active]:bg-primary/10">
                  <Truck className="h-4 w-4 mr-2" />
                  Suppliers
                </TabsTrigger>
              )}
              <TabsTrigger value="headings" className="data-[state=active]:bg-primary/10">
                <Layers className="h-4 w-4 mr-2" />
                Headings
              </TabsTrigger>
              <TabsTrigger value="treatment-options" className="data-[state=active]:bg-primary/10">
                <Sliders className="h-4 w-4 mr-2" />
                Options
              </TabsTrigger>
              <TabsTrigger value="defaults" className="data-[state=active]:bg-primary/10">
                <Settings className="h-4 w-4 mr-2" />
                Defaults
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-primary/10">
                <HelpCircle className="h-4 w-4 mr-2" />
                Guide
              </TabsTrigger>
            </TabsList>

            {canViewTemplates && (
              <TabsContent value="templates" className="mt-6">
                <CurtainTemplatesManager 
                  highlightedTemplateId={highlightedTemplateId}
                  createTemplateData={createTemplateData}
                  onTemplateCreated={onTemplateCreated}
                  editTemplateId={editTemplateId}
                  onTemplateEdited={onTemplateEdited}
                />
              </TabsContent>
            )}

            {hasTWCIntegration && (
              <TabsContent value="suppliers" className="mt-6">
                <TWCLibraryBrowser />
              </TabsContent>
            )}

            <TabsContent value="headings" className="mt-6">
              <HeadingInventoryManager />
            </TabsContent>

            <TabsContent value="treatment-options" className="mt-6">
              <WindowTreatmentOptionsManager />
            </TabsContent>

            <TabsContent value="defaults" className="mt-6">
              <ManufacturingDefaults />
            </TabsContent>

            <TabsContent value="guide" className="mt-6">
              <OptionsArchitectureGuide />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
