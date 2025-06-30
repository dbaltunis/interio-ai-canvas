
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Users, Calculator, Wrench, DollarSign, Truck, Zap } from "lucide-react";
import { BusinessConfigTab } from "./tabs/BusinessConfigTab";
import { ProductCatalogTab } from "./tabs/ProductCatalogTab";
import { VendorManagementTab } from "./tabs/VendorManagementTab";
import { PricingRulesTab } from "./tabs/PricingRulesTab";
import { TreatmentTypesTab } from "./tabs/TreatmentTypesTab";
import { CalculationEngineTab } from "./tabs/CalculationEngineTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { IntegrationManager } from "../integrations/IntegrationManager";

export const SettingsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Business Settings</h2>
          <p className="text-brand-neutral">
            Configure your business rules, products, and automation settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Treatments
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculations
          </TabsTrigger>
          <TabsTrigger value="legacy-integrations" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Legacy
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessConfigTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductCatalogTab />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorManagementTab />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingRulesTab />
        </TabsContent>

        <TabsContent value="treatments">
          <TreatmentTypesTab />
        </TabsContent>

        <TabsContent value="calculations">
          <CalculationEngineTab />
        </TabsContent>

        <TabsContent value="legacy-integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
