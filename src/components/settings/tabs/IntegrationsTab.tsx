
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Zap, CreditCard, MessageSquare, Calendar, Package, Building, Database, AlertCircle, CheckCircle2, Globe, Truck } from "lucide-react";
import { SendGridIntegrationTab } from "./SendGridIntegrationTab";
import { GoogleCalendarTab } from "./GoogleCalendarTab";
import { TIGPIMIntegrationTab } from "@/components/integrations/TIGPIMIntegrationTab";
import { MYOBExoIntegrationTab } from "@/components/integrations/MYOBExoIntegrationTab";
import { RFMSIntegrationTab } from "@/components/integrations/RFMSIntegrationTab";
import { TwilioIntegrationTab } from "@/components/integrations/TwilioIntegrationTab";
import { TWCIntegrationTab } from "@/components/integrations/TWCIntegrationTab";
import { WebsiteAPIIntegrationTab } from "@/components/integrations/WebsiteAPIIntegrationTab";
import { ShopifySetupTab } from "@/components/library/shopify/ShopifySetupTab";
import { ShopifyStatusManagementTab } from "./ShopifyStatusManagementTab";
import { StripeIntegrationTab } from "./StripeIntegrationTab";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const IntegrationsTab = () => {
  const { user } = useAuth();
  const { integrations } = useIntegrations();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const [activeTab, setActiveTab] = useState("email");
  
  // Permission checks - following the same pattern as other settings
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-integrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[IntegrationsTab] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if view_shopify is explicitly in user_permissions table
  const hasViewShopifyPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_shopify'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Check view_shopify permission using the same pattern
  const canViewShopify = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewShopifyPermission
        : hasViewShopifyPermission;

  // Handle tab change with permission check
  const handleTabChange = (value: string) => {
    if (value === "shopify") {
      const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
      if (isPermissionLoaded && !canViewShopify) {
        toast.error("Permission Denied", {
          description: "You don't have permission to view Shopify integration.",
        });
        return;
      }
      if (!isPermissionLoaded) {
        toast("Loading", {
          description: "Please wait while permissions are being checked...",
        });
        return;
      }
    }
    setActiveTab(value);
  };
  
  const getIntegrationByType = (type: string) => 
    integrations.find(integration => integration.integration_type === type);

  // Calculate integration status - include Shopify if active
  const activeIntegrations = integrations.filter(i => i.active);
  const totalShopifyCount = shopifyIntegration ? 1 : 0;
  const totalIntegrations = integrations.length + totalShopifyCount;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your business with external services and APIs
        </p>
      </div>

      {/* Integration Status Overview */}
      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertTitle>Integration Status</AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={(activeIntegrations.length + (shopifyIntegration ? 1 : 0)) > 0 ? "default" : "secondary"}>
              {activeIntegrations.length + (shopifyIntegration ? 1 : 0)} of {totalIntegrations > 0 ? totalIntegrations : 9} integrations active
            </Badge>
            {(activeIntegrations.length + (shopifyIntegration ? 1 : 0)) === 0 && (
              <span className="text-xs text-muted-foreground">Configure integrations below to connect your services</span>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="flex gap-1 w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="pim" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            PIM
          </TabsTrigger>
          <TabsTrigger value="erp" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            ERP
          </TabsTrigger>
          <TabsTrigger value="rfms" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            RFMS
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website API
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger 
            value="shopify" 
            className="flex items-center gap-2"
            disabled={!canViewShopify && !permissionsLoading && !roleLoading && explicitPermissions !== undefined}
            title={!canViewShopify && !permissionsLoading && !roleLoading && explicitPermissions !== undefined ? "You don't have permission to view Shopify integration" : undefined}
          >
            <Package className="h-4 w-4" />
            Shopify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <SendGridIntegrationTab />
        </TabsContent>

        <TabsContent value="calendar">
          <GoogleCalendarTab />
        </TabsContent>

        <TabsContent value="pim">
          <TIGPIMIntegrationTab integration={getIntegrationByType('tig_pim') as any} />
        </TabsContent>

        <TabsContent value="erp">
          <MYOBExoIntegrationTab integration={getIntegrationByType('myob_exo') as any} />
        </TabsContent>

        <TabsContent value="rfms">
          <RFMSIntegrationTab integration={getIntegrationByType('rfms') as any} />
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Integrations</CardTitle>
              <CardDescription>
                Connect with automation platforms like Zapier, Make, and others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Automation integrations coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <StripeIntegrationTab />
        </TabsContent>

        <TabsContent value="communication">
          <TwilioIntegrationTab />
        </TabsContent>

        <TabsContent value="website">
          <WebsiteAPIIntegrationTab integration={getIntegrationByType('website_api') as any} />
        </TabsContent>

        <TabsContent value="suppliers">
          <TWCIntegrationTab />
        </TabsContent>

        {canViewShopify && (
          <TabsContent value="shopify">
            <div className="space-y-6">
              <ShopifySetupTab integration={shopifyIntegration} />
              {shopifyIntegration?.is_connected && <ShopifyStatusManagementTab />}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
