
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCalculationFormulas } from "@/hooks/useCalculationFormulas";
import { DEFAULT_FABRIC_FORMULAS } from "@/utils/defaultCalculationFormulas";

export const DefaultFormulasLoader = () => {
  const { toast } = useToast();
  const { createFormula, data: existingFormulas } = useCalculationFormulas();
  const [isLoading, setIsLoading] = useState(false);

  const loadDefaultFormulas = async () => {
    setIsLoading(true);
    try {
      let addedCount = 0;
      
      for (const formula of DEFAULT_FABRIC_FORMULAS) {
        // Check if formula with same name already exists
        const exists = existingFormulas?.some(f => f.name === formula.name);
        
        if (!exists) {
          await createFormula.mutateAsync(formula);
          addedCount++;
        }
      }

      toast({
        title: "Default Formulas Loaded",
        description: `Added ${addedCount} new calculation formulas to your library. ${DEFAULT_FABRIC_FORMULAS.length - addedCount} formulas were already present.`
      });
    } catch (error) {
      console.error('Error loading default formulas:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load default formulas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyDefaults = existingFormulas?.some(f => 
    DEFAULT_FABRIC_FORMULAS.some(df => df.name === f.name)
  );

  const fabricFormulas = DEFAULT_FABRIC_FORMULAS.filter(f => f.category === 'fabric_calculation');
  const pricingFormulas = DEFAULT_FABRIC_FORMULAS.filter(f => f.category === 'pricing_calculation');
  const laborFormulas = DEFAULT_FABRIC_FORMULAS.filter(f => f.category === 'labor_calculation');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Industry Standard Formulas
        </CardTitle>
        <CardDescription>
          Load proven fabric, pricing, and labor calculation formulas used by professional curtain makers. 
          Includes step-by-step calculations for fabric usage, costs, labor time, and complete project pricing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-brand-neutral">
            <p className="font-medium mb-3">This will add {DEFAULT_FABRIC_FORMULAS.length} professional formulas:</p>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium text-green-700 mb-1">📏 Fabric Calculations ({fabricFormulas.length} formulas):</p>
                <ul className="space-y-1 ml-4 text-xs">
                  <li>• <strong>Cut Drop Calculation</strong> - Basic length with allowances</li>
                  <li>• <strong>Pattern Repeat Adjustment</strong> - Handles pattern matching</li>
                  <li>• <strong>Gather Width & Fabric Widths</strong> - Track width × fullness calculations</li>
                  <li>• <strong>Total Meterage</strong> - Final fabric to order</li>
                  <li>• <strong>Quick Estimate</strong> - All-in-one fabric calculation</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-blue-700 mb-1">💰 Pricing Calculations ({pricingFormulas.length} formulas):</p>
                <ul className="space-y-1 ml-4 text-xs">
                  <li>• <strong>Fabric Cost</strong> - Meterage × price per meter</li>
                  <li>• <strong>Making Costs</strong> - Per width OR per meter methods</li>
                  <li>• <strong>Lining & Heading</strong> - Separate pricing when needed</li>
                  <li>• <strong>Track & Installation</strong> - Hardware and fitting costs</li>
                  <li>• <strong>Accessories</strong> - Tiebacks, hooks, extras</li>
                  <li>• <strong>Total Project Cost</strong> - Complete cost breakdown</li>
                  <li>• <strong>Final Price with VAT</strong> - Customer pricing</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-purple-700 mb-1">👷‍♀️ Labor Calculations ({laborFormulas.length} formulas):</p>
                <ul className="space-y-1 ml-4 text-xs">
                  <li>• <strong>Labor Per Width</strong> - Common for traditional curtains</li>
                  <li>• <strong>Labor Per Meter</strong> - Often used for wave curtains</li>
                  <li>• <strong>Fixed Rate Per Pair</strong> - Best for simple projects</li>
                  <li>• <strong>Lining & Heading Labor</strong> - Separate labor charges</li>
                  <li>• <strong>Panel Joining</strong> - Cost per join when needed</li>
                  <li>• <strong>Roman Blind Labor</strong> - Per meter and tiered pricing</li>
                  <li>• <strong>Installation Labor</strong> - Per meter and fixed rates</li>
                  <li>• <strong>Total Labor Cost</strong> - Complete labor breakdown</li>
                  <li>• <strong>Time Estimation</strong> - Hours based on complexity</li>
                </ul>
              </div>
            </div>
          </div>
          
          {hasAnyDefaults && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              Some default formulas are already in your library. Only missing formulas will be added.
            </div>
          )}

          <Button 
            onClick={loadDefaultFormulas}
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-accent"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading Formulas...' : `Load ${DEFAULT_FABRIC_FORMULAS.length} Industry Standard Formulas`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
