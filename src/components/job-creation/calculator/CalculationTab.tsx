
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";
import { TreatmentFormData, CalculationResult } from './types';
import { formatCurrency } from './calculationUtils';

interface CalculationTabProps {
  formData: TreatmentFormData;
  calculation: CalculationResult;
}

export const CalculationTab = ({ formData, calculation }: CalculationTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Material Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fabric needed:</span>
                  <span className="font-medium">{calculation.fabricYards} yards</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor hours:</span>
                  <span className="font-medium">{calculation.laborHours} hours</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Selected Fabric</h4>
              <div className="text-sm">
                {formData.selectedFabric ? (
                  <div className="space-y-1">
                    <p className="font-medium">{formData.selectedFabric.name}</p>
                    <p className="text-muted-foreground">Code: {formData.selectedFabric.code}</p>
                    <p>{formatCurrency(formData.selectedFabric.pricePerYard)}/yard</p>
                  </div>
                ) : formData.fabricName ? (
                  <div className="space-y-1">
                    <p className="font-medium">{formData.fabricName}</p>
                    <p>{formatCurrency(parseFloat(formData.fabricPricePerYard) || 0)}/yard</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No fabric selected</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Fabric cost:</span>
                <span>{formatCurrency(calculation.fabricCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor cost:</span>
                <span>{formatCurrency(calculation.laborCost)}</span>
              </div>
              {calculation.featuresCost > 0 && (
                <div className="flex justify-between">
                  <span>Additional features:</span>
                  <span>{formatCurrency(calculation.featuresCost)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Markup ({formData.markupPercentage}%):</span>
                <span>{formatCurrency(calculation.total - calculation.subtotal)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                <span>Total Price:</span>
                <span className="text-primary">{formatCurrency(calculation.total)}</span>
              </div>
            </div>
          </div>

          {formData.additionalFeatures.filter(f => f.selected).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Selected Features</h4>
                <div className="space-y-1">
                  {formData.additionalFeatures.filter(f => f.selected).map(feature => (
                    <div key={feature.id} className="flex justify-between text-sm">
                      <span>{feature.name}</span>
                      <span>{formatCurrency(feature.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
