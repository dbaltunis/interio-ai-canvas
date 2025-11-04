import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { PricingGridWizard } from "../pricing-grids/PricingGridWizard";
import { GridResolutionTester } from "../pricing-grids/GridResolutionTester";
import { Layers, Settings, Sliders, Library, Grid3x3, Route } from "lucide-react";
export const WindowCoveringsTab = () => {
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Price Lists
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

            <TabsContent value="pricing" className="space-y-6">
              <PricingGridWizard />
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Test Pricing Resolution</h3>
                <GridResolutionTester />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};