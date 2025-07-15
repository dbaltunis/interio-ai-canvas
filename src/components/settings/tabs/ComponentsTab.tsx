
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardwareComponentsManager } from "./components/HardwareComponentsManager";
import { FabricAccessoriesManager } from "./components/FabricAccessoriesManager";
import { HeadingComponentsManager } from "./components/HeadingComponentsManager";
import { ServiceComponentsManager } from "./components/ServiceComponentsManager";
import { PartsAccessoriesManager } from "./components/PartsAccessoriesManager";

export const ComponentsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Components</h3>
        <p className="text-brand-neutral">
          Manage all components that go into your window coverings
        </p>
      </div>

      <Tabs defaultValue="hardware" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="fabric-accessories">Fabric Accessories</TabsTrigger>
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="parts">Parts & Misc</TabsTrigger>
        </TabsList>

        <TabsContent value="hardware">
          <HardwareComponentsManager />
        </TabsContent>

        <TabsContent value="fabric-accessories">
          <FabricAccessoriesManager />
        </TabsContent>

        <TabsContent value="headings">
          <HeadingComponentsManager />
        </TabsContent>

        <TabsContent value="services">
          <ServiceComponentsManager />
        </TabsContent>

        <TabsContent value="parts">
          <PartsAccessoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
