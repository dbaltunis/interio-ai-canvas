
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { type WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";

interface OptionsSelectorProps {
  availableOptions: WindowCoveringOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isLoading: boolean;
}

export const OptionsSelector = ({ 
  availableOptions, 
  selectedOptions, 
  onOptionToggle, 
  isLoading 
}: OptionsSelectorProps) => {
  if (availableOptions.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No options configured for this window covering.</p>
        </CardContent>
      </Card>
    );
  }

  // Group options by type for better organization
  const groupedOptions = availableOptions.reduce((acc, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {} as Record<string, WindowCoveringOption[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Choose from available options for this window covering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Loading options...</div>
        ) : (
          Object.entries(groupedOptions).map(([optionType, options]) => (
            <div key={optionType} className="space-y-3">
              <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
              <div className="grid grid-cols-1 gap-3">
                {options.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => onOptionToggle(option.id)}
                      disabled={option.is_required}
                      className="rounded border-gray-300"
                    />
                    
                    {/* Option Image */}
                    {option.image_url && (
                      <img 
                        src={option.image_url} 
                        alt={option.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                    
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{option.name}</span>
                          {option.description && (
                            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            £{option.base_cost} {option.cost_type}
                          </Badge>
                          {option.is_required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          {option.is_default && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
