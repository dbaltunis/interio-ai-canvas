import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { Layers, Settings, Sliders, Library } from "lucide-react";
export const WindowCoveringsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          <CardDescription>
            Configure templates, headings, options, and defaults for your window treatments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary/10">
                <Layers className="h-4 w-4 mr-2" />
                My Templates
              </TabsTrigger>
              <TabsTrigger value="system-library" className="data-[state=active]:bg-primary/10">
                <Library className="h-4 w-4 mr-2" />
                Template Library
              </TabsTrigger>
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
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              <CurtainTemplatesManager />
            </TabsContent>

            <TabsContent value="system-library" className="mt-6">
              <SystemTemplatesLibrary />
            </TabsContent>

            <TabsContent value="headings" className="mt-6">
              <HeadingInventoryManager />
            </TabsContent>

            <TabsContent value="treatment-options" className="mt-6">
              <WindowTreatmentOptionsManager />
            </TabsContent>

            <TabsContent value="defaults" className="mt-6">
              <ManufacturingDefaults />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};