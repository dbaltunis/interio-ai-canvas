import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { PricingGridTest } from "../PricingGridTest";
import { Layers, Settings, Sliders, Library, FlaskConical } from "lucide-react";
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
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Testing
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

            <TabsContent value="testing" className="space-y-6">
              <PricingGridTest />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};