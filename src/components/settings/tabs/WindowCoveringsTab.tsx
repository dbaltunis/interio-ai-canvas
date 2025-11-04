import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { Layers, Settings, Sliders, Library } from "lucide-react";
export const WindowCoveringsTab = () => {
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
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
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};