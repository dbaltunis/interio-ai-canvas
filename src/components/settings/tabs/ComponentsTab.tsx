
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingsSection } from "./components/HeadingsSection";
import { HardwareSection } from "./components/HardwareSection";
import { LiningsSection } from "./components/LiningsSection";
import { ServicesSection } from "./components/ServicesSection";
import { PricingGridsSection } from "./components/PricingGridsSection";
import { PartsSection } from "./components/PartsSection";

export const ComponentsTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Component Library</h3>
          <p className="text-sm text-brand-neutral">Manage reusable components for your products</p>
        </div>
      </div>

      <Tabs defaultValue="headings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="linings">Linings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="pricing-grids">Pricing Grids</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="headings">
          <HeadingsSection />
        </TabsContent>

        <TabsContent value="hardware">
          <HardwareSection />
        </TabsContent>

        <TabsContent value="linings">
          <LiningsSection />
        </TabsContent>

        <TabsContent value="services">
          <ServicesSection />
        </TabsContent>

        <TabsContent value="pricing-grids">
          <PricingGridsSection />
        </TabsContent>

        <TabsContent value="parts">
          <PartsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
