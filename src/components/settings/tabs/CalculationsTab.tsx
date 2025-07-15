
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculationFormulasManager } from "./calculations/CalculationFormulasManager";
import { PricingMethodsManager } from "./calculations/PricingMethodsManager";
import { MakingCostsManager } from "./calculations/MakingCostsManager";
import { PricingGridsManager } from "./calculations/PricingGridsManager";

export const CalculationsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">Calculations & Pricing</h3>
        <p className="text-brand-neutral">
          Configure calculation formulas, pricing methods, and cost structures
        </p>
      </div>

      <Tabs defaultValue="formulas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="formulas">Calculation Formulas</TabsTrigger>
          <TabsTrigger value="pricing-methods">Pricing Methods</TabsTrigger>
          <TabsTrigger value="making-costs">Making Costs</TabsTrigger>
          <TabsTrigger value="pricing-grids">Pricing Grids</TabsTrigger>
        </TabsList>

        <TabsContent value="formulas">
          <CalculationFormulasManager />
        </TabsContent>

        <TabsContent value="pricing-methods">
          <PricingMethodsManager />
        </TabsContent>

        <TabsContent value="making-costs">
          <MakingCostsManager />
        </TabsContent>

        <TabsContent value="pricing-grids">
          <PricingGridsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
