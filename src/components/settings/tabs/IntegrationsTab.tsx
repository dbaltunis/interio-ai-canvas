import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, CreditCard, Calendar, Package, Building, CheckCircle2, Globe, Truck } from "lucide-react";
import { SendGridIntegrationTab } from "./SendGridIntegrationTab";
import { GoogleCalendarTab } from "./GoogleCalendarTab";
import { TIGPIMIntegrationTab } from "@/components/integrations/TIGPIMIntegrationTab";
import { MYOBExoIntegrationTab } from "@/components/integrations/MYOBExoIntegrationTab";
import { NetSuiteIntegrationTab } from "@/components/integrations/NetSuiteIntegrationTab";
import { RFMSIntegrationTab } from "@/components/integrations/RFMSIntegrationTab";
import { SuppliersIntegrationTab } from "@/components/integrations/SuppliersIntegrationTab";
import { WebsiteAPIIntegrationTab } from "@/components/integrations/WebsiteAPIIntegrationTab";
import { ShopifySetupTab } from "@/components/library/shopify/ShopifySetupTab";
import { ShopifyStatusManagementTab } from "./ShopifyStatusManagementTab";
import { StripeIntegrationTab } from "./StripeIntegrationTab";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useHasPermission } from "@/hooks/usePermissions";
import { useState } from "react";
import { toast } from "sonner";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import rfmsLogo from "@/assets/rfms-logo.svg";
import netsuiteLogo from "@/assets/netsuite-logo.svg";

export const IntegrationsTab = () => {
  const { integrations } = useIntegrations();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const [activeTab, setActiveTab] = useState("suppliers");

  // Permission check using centralized hook
  const canViewShopify = useHasPermission('view_shopify') !== false;

  // Handle tab change with permission check
  const handleTabChange = (value: string) => {
    if (value === "online-sales" && !canViewShopify) {
      toast.error("Permission Denied", {
        description: "You don't have permission to view online sales integrations.",
      });
      return;
    }
    setActiveTab(value);
  };

  const getIntegrationByType = (type: string) =>
    integrations.find(integration => integration.integration_type === type);

  // Calculate integration status - include Shopify if active
  const activeIntegrations = integrations.filter(i => i.active);
  const totalShopifyCount = shopifyIntegration ? 1 : 0;
  const totalIntegrations = integrations.length + totalShopifyCount;

  // ERP integrations data
  const rfmsIntegration = getIntegrationByType('rfms') as any;
  const netsuiteIntegration = getIntegrationByType('netsuite') as any;
  const myobExoIntegration = getIntegrationByType('myob_exo') as any;

  const erpSystems = [
    {
      id: "rfms",
      name: "RFMS Australasia",
      description: "Retail Floor Management System -- quotes, measurements & job management",
      logo: rfmsLogo,
      logoClass: "h-10 w-auto object-contain",
      integration: rfmsIntegration,
      component: <RFMSIntegrationTab integration={rfmsIntegration} />,
    },
    {
      id: "netsuite",
      name: "Oracle NetSuite",
      description: "Cloud ERP -- accounting, inventory & order management",
      logo: netsuiteLogo,
      logoClass: "h-10 w-auto object-contain",
      integration: netsuiteIntegration,
      component: <NetSuiteIntegrationTab integration={netsuiteIntegration} />,
    },
    {
      id: "myob_exo",
      name: "MYOB Exo",
      description: "Business management -- accounting, payroll & inventory",
      logo: null,
      logoClass: "",
      integration: myobExoIntegration,
      component: <MYOBExoIntegrationTab integration={myobExoIntegration} />,
    },
  ];

  const erpActiveCount = erpSystems.filter(s => s.integration?.active).length;

  return (
    <div className="space-y-6">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect with external services like ERP, suppliers, calendars, and payments
          </p>
        </div>
        <SectionHelpButton sectionId="integrations" />
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
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="erp" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            ERP & Business
          </TabsTrigger>
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
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="online-sales"
            className="flex items-center gap-2"
            disabled={!canViewShopify}
            title={!canViewShopify ? "You don't have permission to view online sales integrations" : undefined}
          >
            <Globe className="h-4 w-4" />
            Online Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <SuppliersIntegrationTab />
        </TabsContent>

        <TabsContent value="erp">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">ERP & Business Systems</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with ERP and business management systems for quotes, accounting, and inventory sync
                </p>
              </div>
              <Badge variant={erpActiveCount > 0 ? "default" : "secondary"}>
                {erpActiveCount} active
              </Badge>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {erpSystems.map((erp) => (
                <AccordionItem
                  key={erp.id}
                  value={erp.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      {erp.logo ? (
                        <img
                          src={erp.logo}
                          alt={`${erp.name} logo`}
                          className={erp.logoClass}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{erp.name}</span>
                          {erp.integration?.active && (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          {erp.description}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {erp.component}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <SendGridIntegrationTab />
        </TabsContent>

        <TabsContent value="calendar">
          <GoogleCalendarTab />
        </TabsContent>

        <TabsContent value="pim">
          <TIGPIMIntegrationTab integration={getIntegrationByType('tig_pim') as any} />
        </TabsContent>

        <TabsContent value="payments">
          <StripeIntegrationTab />
        </TabsContent>

        {canViewShopify && (
          <TabsContent value="online-sales">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Online Sales Channels</h3>
              <p className="text-sm text-muted-foreground -mt-4">
                Connect your website and e-commerce platforms
              </p>

              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="website" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Website API</span>
                          {getIntegrationByType('website_api')?.active && (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          Connect your website for lead capture and quote requests
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <WebsiteAPIIntegrationTab integration={getIntegrationByType('website_api') as any} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shopify" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-[#96bf48]/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#96bf48]" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Shopify</span>
                          {shopifyIntegration?.is_connected && (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          Sync products and orders with your Shopify store
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-6">
                      <ShopifySetupTab integration={shopifyIntegration} />
                      {shopifyIntegration?.is_connected && <ShopifyStatusManagementTab />}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
