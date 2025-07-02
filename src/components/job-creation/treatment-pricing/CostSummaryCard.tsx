
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CostSummaryCardProps {
  costs: {
    fabricCost: string;
    optionsCost: string;
    laborCost: string;
    totalCost: string;
    optionDetails?: Array<{ name: string; cost: number; method: string; calculation?: string }>;
  };
  treatmentType?: string;
  selectedOptions?: string[];
  availableOptions?: any[];
  hierarchicalOptions?: any[];
  formData?: any;
}

export const CostSummaryCard = ({ 
  costs, 
  treatmentType, 
  selectedOptions = [], 
  availableOptions = [],
  hierarchicalOptions = [],
  formData
}: CostSummaryCardProps) => {
  const { units } = useMeasurementUnits();

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${numAmount.toFixed(2)}`;
  };

  const getPricingMethodDescription = (method: string) => {
    const descriptions: Record<string, string> = {
      'per-unit': 'Per unit/panel',
      'per-panel': 'Per panel',
      'per-meter': 'Per meter of rail width',
      'per-metre': 'Per metre of rail width', 
      'per-linear-meter': 'Per linear meter of rail width',
      'per-linear-yard': 'Per linear yard of rail width',
      'per-yard': 'Per yard of rail width',
      'per-sqm': 'Per square meter of area',
      'per-square-meter': 'Per square meter of area',
      'percentage': 'Percentage of fabric cost',
      'fixed': 'Fixed cost'
    };
    return descriptions[method] || method;
  };

  // Get all selected option details including hierarchical ones
  const getAllSelectedOptionDetails = () => {
    // Use the calculated option details from costs if available
    if (costs.optionDetails && costs.optionDetails.length > 0) {
      return costs.optionDetails;
    }

    // Fallback to basic calculation
    const selectedDetails: Array<{ name: string; cost: number; method: string; calculation?: string }> = [];

    availableOptions.forEach(option => {
      if (selectedOptions.includes(option.id)) {
        selectedDetails.push({
          name: option.name,
          cost: option.base_cost || 0,
          method: option.pricing_method || option.cost_type || 'fixed',
          calculation: `Fixed cost: ${(option.base_cost || 0).toFixed(2)}`
        });
      }
    });

    // Check hierarchical options
    hierarchicalOptions.forEach(category => {
      category.subcategories?.forEach((subcategory: any) => {
        subcategory.sub_subcategories?.forEach((subSub: any) => {
          if (selectedOptions.includes(subSub.id)) {
            selectedDetails.push({
              name: subSub.name,
              cost: subSub.base_price || 0,
              method: subSub.pricing_method || 'fixed',
              calculation: `Fixed cost: ${(subSub.base_price || 0).toFixed(2)}`
            });
          }
          
          // Check extras
          subSub.extras?.forEach((extra: any) => {
            if (selectedOptions.includes(extra.id)) {
              selectedDetails.push({
                name: extra.name,
                cost: extra.base_price || 0,
                method: extra.pricing_method || 'fixed',
                calculation: `Fixed cost: ${(extra.base_price || 0).toFixed(2)}`
              });
            }
          });
        });
      });
    });

    return selectedDetails;
  };

  const selectedOptionDetails = getAllSelectedOptionDetails();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Fabric Cost:</span>
          <span>{formatCurrency(costs.fabricCost)}</span>
        </div>
        
        {/* Itemized Options with Detailed Calculations */}
        {selectedOptionDetails.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Selected Options:</div>
            {selectedOptionDetails.map((option, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm pl-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600">• {option.name}:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p><strong>Pricing:</strong> {getPricingMethodDescription(option.method)}</p>
                          {option.calculation && (
                            <p><strong>Calculation:</strong> {option.calculation}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span>{formatCurrency(option.cost)}</span>
                </div>
                <div className="text-xs text-gray-500 pl-6">
                  <div className="font-medium text-gray-600">{getPricingMethodDescription(option.method)}</div>
                  {option.calculation && (
                    <div className="mt-1">{option.calculation}</div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium border-t pt-1">
              <span>Options Total:</span>
              <span>{formatCurrency(costs.optionsCost)}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span>Labor Cost:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Labor cost is set for each treatment type. You can update it in Settings → Treatments → {treatmentType || 'Treatment Types'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span>{formatCurrency(costs.laborCost)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total Cost:</span>
          <span className="text-green-600">{formatCurrency(costs.totalCost)}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Note:</strong> Labor cost comes from the treatment type settings (Settings → Treatments). Option costs are calculated based on measurements and pricing methods.</p>
        </div>
      </CardContent>
    </Card>
  );
};
