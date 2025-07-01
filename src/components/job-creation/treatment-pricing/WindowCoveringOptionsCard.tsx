
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
    return null; // Don't show anything if no options - removed the yellow notification
  }

  // Group options by type for better organization
  const safeOptions = Array.isArray(options) ? options : [];
  const groupedOptions = safeOptions.reduce((acc, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Window Covering Options</CardTitle>
        <p className="text-sm text-gray-600">Available options for {windowCovering?.name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedOptions).map(([optionType, typeOptions]) => (
          <div key={optionType} className="space-y-3">
            <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
            <div className="space-y-2">
              {Array.isArray(typeOptions) && typeOptions.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);
                
                return (
                  <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onOptionToggle(option.id)}
                        disabled={option.is_required}
                      />
                      
                      {/* Option Image */}
                      {option.image_url && (
                        <img 
                          src={option.image_url} 
                          alt={option.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                      
                      <div>
                        <div className="font-medium">{option.name}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600">{option.description}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Cost: {option.cost_type}
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
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
