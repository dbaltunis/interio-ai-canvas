
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface WindowCoveringOptionsCardProps {
  options: any[];
  optionsLoading: boolean;
  windowCovering: any;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const WindowCoveringOptionsCard = ({ 
  options, 
  optionsLoading, 
  windowCovering, 
  selectedOptions, 
  onOptionToggle 
}: WindowCoveringOptionsCardProps) => {
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

  if (optionsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">Loading window covering options...</div>
        </CardContent>
      </Card>
    );
  }

  if (!windowCovering) {
    return null;
  }

  if (!options || options.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-700">
            No options found for window covering "{windowCovering.name}" (ID: {windowCovering.id})
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            You can configure options in Settings → Products → Window Coverings → {windowCovering.name}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Window Covering Options</CardTitle>
        <p className="text-sm text-gray-600">Available options for {windowCovering?.name}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map(option => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onOptionToggle(option.id)}
                  disabled={option.is_required}
                />
                <div>
                  <div className="font-medium">{option.name}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600">{option.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {option.option_type} • Cost: {option.cost_type}
                    {option.is_required && <span className="text-red-600 ml-2">• Required</span>}
                    {option.is_default && <span className="text-blue-600 ml-2">• Default</span>}
                  </div>
                </div>
              </div>
              <Badge variant={isSelected ? "default" : "outline"}>
                {formatCurrency(option.base_cost)}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
