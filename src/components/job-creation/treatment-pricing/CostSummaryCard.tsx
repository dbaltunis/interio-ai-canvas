
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info, AlertTriangle, RotateCw, Scissors } from "lucide-react";

interface CostSummaryCardProps {
  costs: {
    fabricCost: string;
    optionsCost: string;
    laborCost: string;
    totalCost: string;
    fabricUsage: string;
    fabricOrientation?: string;
    costComparison?: any;
    warnings?: string[];
    seamsRequired?: number;
    seamLaborHours?: number;
    widthsRequired?: number;
    optionDetails?: Array<{ name: string; cost: number; method: string; calculation: string }>;
  };
  treatmentType: string;
  selectedOptions: string[];
  availableOptions: any[];
  hierarchicalOptions: any[];
  formData: any;
}

export const CostSummaryCard = ({ 
  costs, 
  treatmentType, 
  selectedOptions, 
  availableOptions, 
  hierarchicalOptions,
  formData 
}: CostSummaryCardProps) => {
  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `£${value.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cost Summary</span>
          <div className="flex items-center space-x-2">
            {costs.fabricOrientation && (
              <Badge variant={costs.fabricOrientation === 'vertical' ? 'default' : 'secondary'}>
                <RotateCw className="w-3 h-3 mr-1" />
                {costs.fabricOrientation}
              </Badge>
            )}
            {costs.seamsRequired && costs.seamsRequired > 0 && (
              <Badge variant="outline">
                <Scissors className="w-3 h-3 mr-1" />
                {costs.seamsRequired} seam{costs.seamsRequired > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manufacturing Complexity Info */}
        {(costs.seamsRequired && costs.seamsRequired > 0) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-xs">
                <div><strong>Manufacturing complexity:</strong></div>
                <div>• {costs.widthsRequired} fabric width{costs.widthsRequired && costs.widthsRequired > 1 ? 's' : ''} required</div>
                <div>• {costs.seamsRequired} seam{costs.seamsRequired > 1 ? 's' : ''} to join widths</div>
                <div>• Additional {costs.seamLaborHours?.toFixed(1)}h for seaming work</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {costs.warnings && costs.warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {costs.warnings.map((warning, index) => (
                  <div key={index} className="text-xs">{warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Fabric Cost:</span>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(costs.fabricCost)}</div>
              <div className="text-xs text-gray-500">{costs.fabricUsage} yards</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Labor Cost:</span>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(costs.laborCost)}</div>
              {costs.seamLaborHours && costs.seamLaborHours > 0 && (
                <div className="text-xs text-gray-500">
                  Inc. {costs.seamLaborHours.toFixed(1)}h seaming
                </div>
              )}
            </div>
          </div>
          
          {parseFloat(costs.optionsCost) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Options Cost:</span>
              <span className="font-medium">{formatCurrency(costs.optionsCost)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Cost:</span>
            <span className="text-green-600">{formatCurrency(costs.totalCost)}</span>
          </div>
          
          <div className="text-xs text-gray-500 text-right">
            Per panel: {formatCurrency(parseFloat(costs.totalCost) / (formData?.quantity || 1))}
          </div>
        </div>

        {/* Options Details */}
        {costs.optionDetails && costs.optionDetails.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Selected Options:</h4>
            <div className="space-y-2">
              {costs.optionDetails.map((option, index) => (
                <div key={index} className="flex justify-between items-start text-xs">
                  <div className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-gray-500">{option.calculation}</div>
                  </div>
                  <div className="font-medium ml-2">{formatCurrency(option.cost)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Optimization Suggestion */}
        {costs.costComparison && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Cost Optimization</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Current: {costs.fabricOrientation} orientation</div>
              <div>Alternative could save: {formatCurrency(costs.costComparison.savings)}</div>
              <div className="font-medium">Consider rotating fabric if pattern allows</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
