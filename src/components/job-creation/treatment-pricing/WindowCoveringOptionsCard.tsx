
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

  // Enhanced debugging
  console.log('WindowCoveringOptionsCard - Props received:');
  console.log('- options:', options);
  console.log('- optionsLoading:', optionsLoading);
  console.log('- windowCovering:', windowCovering);
  console.log('- windowCovering.id:', windowCovering?.id);
  console.log('- selectedOptions:', selectedOptions);
  console.log('- options length:', options?.length);
  console.log('- options type:', typeof options);
  console.log('- options is array:', Array.isArray(options));

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
    console.log('WindowCoveringOptionsCard - Showing loading state');
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">Loading window covering options...</div>
        </CardContent>
      </Card>
    );
  }

  if (!windowCovering) {
    console.log('WindowCoveringOptionsCard - No window covering provided');
    return null; // Don't show the card if no window covering
  }

  if (!options || options.length === 0) {
    console.log('WindowCoveringOptionsCard - No options found, showing empty state');
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Window Covering Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-yellow-700">
            No options found for window covering "{windowCovering.name}" (ID: {windowCovering.id})
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            You can configure options in Settings → Products → Window Coverings → {windowCovering.name}
          </p>
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Window Covering ID: {windowCovering.id}</p>
            <p>Options Array: {JSON.stringify(options)}</p>
            <p>Options Loading: {optionsLoading.toString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('WindowCoveringOptionsCard - Rendering options:', options.length);

  // Group options by type for better organization - ensure options is an array
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
              {typeOptions.map((option, index) => {
                console.log(`WindowCoveringOptionsCard - Rendering option ${index}:`, option);
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
        
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
          <p><strong>Debug Summary:</strong></p>
          <p>Total Options: {safeOptions.length}</p>
          <p>Selected Options: {selectedOptions.length}</p>
          <p>Window Covering: {windowCovering.name} (ID: {windowCovering.id})</p>
        </div>
      </CardContent>
    </Card>
  );
};
