
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Layers, Calculator, Play } from "lucide-react";
import { BusinessConfigTab } from "./tabs/BusinessConfigTab";
import { ProductCatalogTab } from "./tabs/ProductCatalogTab";
import { MeasurementUnitsTab } from "./tabs/MeasurementUnitsTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { ProductTemplatesTab } from "./tabs/ProductTemplatesTab";
import { ComponentsTab } from "./tabs/ComponentsTab";
import { CalculationsTab } from "./tabs/CalculationsTab";
import { TutorialOverlay } from "./TutorialOverlay";
import { InteractiveOnboarding } from "./InteractiveOnboarding";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const SettingsView = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Business Settings</h2>
          <p className="text-brand-neutral">
            Configure your business rules and products
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowInteractiveDemo(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Interactive Demo
          </Button>
          <Button 
            onClick={() => setShowTutorial(true)}
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            Setup Guide
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Units
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Templates
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculations
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessConfigTab />
        </TabsContent>

        <TabsContent value="units">
          <MeasurementUnitsTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductTemplatesTab />
        </TabsContent>

        <TabsContent value="components">
          <ComponentsTab />
        </TabsContent>

        <TabsContent value="calculations">
          <CalculationsTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>

      <TutorialOverlay 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onTabChange={setActiveTab}
      />

      <InteractiveOnboarding
        isOpen={showInteractiveDemo}
        onClose={() => setShowInteractiveDemo(false)}
      />
    </div>
  );
};
