
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
  };
  treatmentType?: string;
  selectedOptions?: string[];
  availableOptions?: any[];
  hierarchicalOptions?: any[];
}

export const CostSummaryCard = ({ 
  costs, 
  treatmentType, 
  selectedOptions = [], 
  availableOptions = [],
  hierarchicalOptions = []
}: CostSummaryCardProps) => {
  const { units } = useMeasurementUnits();

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  // Get selected option details
  const getSelectedOptionDetails = () => {
    const selectedDetails: Array<{ name: string; cost: number }> = [];

    // Check traditional options
    availableOptions.forEach(option => {
      if (selectedOptions.includes(option.id)) {
        selectedDetails.push({
          name: option.name,
          cost: option.base_cost || 0
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
              cost: subSub.base_price || 0
            });
          }
          
          // Check extras
          subSub.extras?.forEach((extra: any) => {
            if (selectedOptions.includes(extra.id)) {
              selectedDetails.push({
                name: extra.name,
                cost: extra.base_price || 0
              });
            }
          });
        });
      });
    });

    return selectedDetails;
  };

  const selectedOptionDetails = getSelectedOptionDetails();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Fabric Cost:</span>
          <span>{formatCurrency(parseFloat(costs.fabricCost))}</span>
        </div>
        
        {/* Itemized Options */}
        {selectedOptionDetails.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Selected Options:</div>
            {selectedOptionDetails.map((option, index) => (
              <div key={index} className="flex justify-between text-sm pl-4">
                <span className="text-gray-600">• {option.name}:</span>
                <span>{formatCurrency(option.cost)}</span>
              </div>
            ))}
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
          <span>{formatCurrency(parseFloat(costs.laborCost))}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total Cost:</span>
          <span className="text-green-600">{formatCurrency(parseFloat(costs.totalCost))}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Note:</strong> Labor cost comes from the treatment type settings. Update it in Settings → Treatments.</p>
        </div>
      </CardContent>
    </Card>
  );
};
