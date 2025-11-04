import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { PricingGridManager } from "../pricing-grids/PricingGridManager";
import { PricingGridRulesManager } from "../pricing-grids/PricingGridRulesManager";
import { Layers, Settings, Sliders, Library, Grid3x3, Route } from "lucide-react";
export const WindowCoveringsTab = () => {
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                My Templates
              </TabsTrigger>
              <TabsTrigger value="system-library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Template Library
              </TabsTrigger>
              <TabsTrigger value="headings" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Headings
              </TabsTrigger>
              <TabsTrigger value="treatment-options" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Options
              </TabsTrigger>
              <TabsTrigger value="defaults" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Defaults
              </TabsTrigger>
              <TabsTrigger value="pricing-grids" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Pricing Grids
              </TabsTrigger>
              <TabsTrigger value="grid-rules" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Grid Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <CurtainTemplatesManager />
            </TabsContent>

            <TabsContent value="system-library" className="space-y-6">
              <SystemTemplatesLibrary />
            </TabsContent>

            <TabsContent value="headings" className="space-y-6">
              <HeadingInventoryManager />
            </TabsContent>

            <TabsContent value="treatment-options" className="space-y-6">
              <WindowTreatmentOptionsManager />
            </TabsContent>

            <TabsContent value="defaults" className="space-y-6">
              <ManufacturingDefaults />
            </TabsContent>

            <TabsContent value="pricing-grids" className="space-y-6">
              <PricingGridManager />
            </TabsContent>

            <TabsContent value="grid-rules" className="space-y-6">
              <PricingGridRulesManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};