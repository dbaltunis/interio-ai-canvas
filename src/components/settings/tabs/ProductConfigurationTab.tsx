
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductTypesManager } from "./product-configuration/ProductTypesManager";
import { MakingCostsManager } from "./product-configuration/MakingCostsManager";
import { FormulaAssignmentManager } from "./product-configuration/FormulaAssignmentManager";
import { ComponentAssignmentManager } from "./product-configuration/ComponentAssignmentManager";

export const ProductConfigurationTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Product Configuration</h3>
        <p className="text-brand-neutral">
          Configure curtain and blind types, calculation methods, and component mappings
        </p>
      </div>

      <Tabs defaultValue="product-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="product-types">Product Types</TabsTrigger>
          <TabsTrigger value="making-costs">Making Costs</TabsTrigger>
          <TabsTrigger value="formulas">Formula Assignment</TabsTrigger>
          <TabsTrigger value="components">Component Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="product-types">
          <ProductTypesManager />
        </TabsContent>

        <TabsContent value="making-costs">
          <MakingCostsManager />
        </TabsContent>

        <TabsContent value="formulas">
          <FormulaAssignmentManager />
        </TabsContent>

        <TabsContent value="components">
          <ComponentAssignmentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
