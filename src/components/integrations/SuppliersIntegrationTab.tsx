import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIntegrations } from "@/hooks/useIntegrations";
import twcLogo from "@/assets/twc-logo.png";
import cwsystemsLogo from "@/assets/cwsystems-logo.svg";
import normanLogo from "@/assets/norman-logo.svg";
import { TWCIntegrationTab } from "./TWCIntegrationTab";
import { CWSystemsIntegrationTab } from "./CWSystemsIntegrationTab";
import { NormanIntegrationTab } from "./NormanIntegrationTab";
import { SupplierManagement } from "@/components/inventory/SupplierManagement";

export const SuppliersIntegrationTab = () => {
  const { integrations } = useIntegrations();

  const twcIntegration = integrations.find(i => i.integration_type === 'twc') as any;
  const cwIntegration = integrations.find(i => i.integration_type === 'cw_systems') as any;
  const normanIntegration = integrations.find(i => i.integration_type === 'norman_australia') as any;

  const suppliers = [
    {
      id: "twc",
      name: "TWC Online Ordering",
      description: "Automated blind ordering via TWC API",
      logo: twcLogo,
      logoClass: "h-10 w-10 rounded-lg object-contain",
      integration: twcIntegration,
      component: <TWCIntegrationTab />,
    },
    {
      id: "cw_systems",
      name: "CW Systems",
      description: "Roller blinds, curtain tracks & motorisation via CORA Trade Hub",
      logo: cwsystemsLogo,
      logoClass: "h-10 w-auto object-contain",
      integration: cwIntegration,
      component: <CWSystemsIntegrationTab />,
    },
    {
      id: "norman",
      name: "Norman Australia",
      description: "Premium shutters, blinds & shades",
      logo: normanLogo,
      logoClass: "h-10 w-auto object-contain",
      integration: normanIntegration,
      component: <NormanIntegrationTab />,
    },
  ];

  const activeCount = suppliers.filter(s => s.integration?.active).length;

  return (
    <div className="space-y-6">
      {/* Manual Supplier Management */}
      <SupplierManagement />

      <Separator />

      {/* Integration-based Suppliers */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Supplier Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect with your product suppliers for automated ordering and product sync
          </p>
        </div>
        <Badge variant={activeCount > 0 ? "default" : "secondary"}>
          {activeCount} active
        </Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {suppliers.map((supplier) => (
          <AccordionItem
            key={supplier.id}
            value={supplier.id}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={supplier.logo}
                  alt={`${supplier.name} logo`}
                  className={supplier.logoClass}
                />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{supplier.name}</span>
                    {supplier.integration?.active && (
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    {supplier.description}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              {supplier.component}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
