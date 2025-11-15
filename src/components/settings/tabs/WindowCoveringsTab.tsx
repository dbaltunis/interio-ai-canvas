import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { SystemTemplatesLibrary } from "./components/SystemTemplatesLibrary";
import { HeadingInventoryManager } from "./components/HeadingInventoryManager";
import { WindowTreatmentOptionsManager } from "./components/WindowTreatmentOptionsManager";
import { ManufacturingDefaults } from "./products/ManufacturingDefaults";
import { OptionsArchitectureGuide } from "./components/OptionsArchitectureGuide";
import { Layers, Settings, Sliders, Library, HelpCircle } from "lucide-react";

export const WindowCoveringsTab = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<string | null>(null);

  const handleTemplateCloned = (templateId: string) => {
    setActiveTab("templates");
    setHighlightedTemplateId(templateId);
    
    // Clear highlight after animation
    setTimeout(() => setHighlightedTemplateId(null), 3000);
  };

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="guide" className="data-[state=active]:bg-primary/10">
                <HelpCircle className="h-4 w-4 mr-2" />
                Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              <CurtainTemplatesManager highlightedTemplateId={highlightedTemplateId} />
            </TabsContent>

            <TabsContent value="system-library" className="mt-6">
              <SystemTemplatesLibrary onTemplateCloned={handleTemplateCloned} />
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

            <TabsContent value="guide" className="mt-6">
              <OptionsArchitectureGuide />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};