
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WindowCoveringsManager } from "./window-coverings/WindowCoveringsManager";
import { FabricsManager } from "./window-coverings/FabricsManager";
import { ProductTemplatesManager } from "./window-coverings/ProductTemplatesManager";

export const WindowCoveringsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Window Coverings</h3>
        <p className="text-brand-neutral">
          Manage your window covering products, fabrics, and templates
        </p>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="types">Window Covering Types</TabsTrigger>
          <TabsTrigger value="fabrics">Fabric Management</TabsTrigger>
          <TabsTrigger value="templates">Product Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <WindowCoveringsManager />
        </TabsContent>

        <TabsContent value="fabrics">
          <FabricsManager />
        </TabsContent>

        <TabsContent value="templates">
          <ProductTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
