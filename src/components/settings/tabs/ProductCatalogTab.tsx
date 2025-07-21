
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { WindowCoveringsManagement } from "./products/WindowCoveringsManagement";
import { MakingCostsManager } from "./products/MakingCostsManager";
import { ComprehensiveCalculator } from "@/components/calculator/ComprehensiveCalculator";

export const ProductCatalogTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Product Management</h3>
        <p className="text-brand-neutral">Manage your window coverings and making cost configurations</p>
      </div>

      <Tabs defaultValue="making-costs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="making-costs">Making Costs</TabsTrigger>
          <TabsTrigger value="window-coverings">Window Coverings</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="making-costs">
          <MakingCostsManager />
        </TabsContent>
        
        <TabsContent value="window-coverings">
          <div className="p-4 text-center text-muted-foreground">
            Window coverings management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="calculator">
          <ComprehensiveCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
