
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Ruler, Zap, Layers, Calculator, Play, Users, FileText, Globe, Shield } from "lucide-react";
import { BusinessConfigTab } from "./tabs/BusinessConfigTab";
// import { WindowCoveringsTab } from "./tabs/WindowCoveringsTab";
import { ComponentsTab } from "./tabs/ComponentsTab";
import { CalculationsTab } from "./tabs/CalculationsTab";
import { MeasurementUnitsTab } from "./tabs/MeasurementUnitsTab";
import { IntegrationsTab } from "./tabs/IntegrationsTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { DocumentTemplatesTab } from "./tabs/DocumentTemplatesTab";
import { SystemSettingsTab } from "./tabs/SystemSettingsTab";
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
        <TabsList className="grid w-full grid-cols-9 text-xs">
          <TabsTrigger value="business" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            <span className="hidden sm:inline">Units</span>
          </TabsTrigger>
          <TabsTrigger value="window-coverings" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span className="hidden sm:inline">Window Coverings</span>
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">Components</span>
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-1">
            <Calculator className="h-3 w-3" />
            <span className="hidden sm:inline">Calculations</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessConfigTab />
        </TabsContent>

        <TabsContent value="units">
          <MeasurementUnitsTab />
        </TabsContent>

        <TabsContent value="window-coverings">
          <div className="p-4 text-center text-muted-foreground">
            Window coverings management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="components">
          <ComponentsTab />
        </TabsContent>

        <TabsContent value="calculations">
          <CalculationsTab />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentTemplatesTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettingsTab />
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
