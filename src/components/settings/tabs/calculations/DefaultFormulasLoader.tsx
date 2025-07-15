
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Industry Standard Formulas
        </CardTitle>
        <CardDescription>
          Load proven fabric calculation formulas used by professional curtain makers. 
          Includes step-by-step calculations for cut drop, pattern repeats, gather width, and meterage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-brand-neutral">
            <p className="font-medium mb-2">This will add the following formulas:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Curtain Fabric Cut Drop</strong> - Basic length calculation with allowances</li>
              <li>• <strong>Pattern Repeat Adjusted Drop</strong> - Handles pattern matching</li>
              <li>• <strong>Total Gather Width</strong> - Track width × fullness ratio</li>
              <li>• <strong>Number of Fabric Widths</strong> - Convert width to fabric widths needed</li>
              <li>• <strong>Total Fabric Meterage</strong> - Final meterage to order</li>
              <li>• <strong>Quick Fabric Estimate</strong> - All-in-one calculation</li>
              <li>• <strong>Fabric Cost Calculation</strong> - Pricing based on meterage</li>
              <li>• <strong>Labor Time Estimate</strong> - Time estimation for making</li>
            </ul>
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
            {isLoading ? 'Loading Formulas...' : 'Load Industry Standard Formulas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
