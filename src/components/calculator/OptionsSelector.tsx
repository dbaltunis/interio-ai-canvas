
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Choose from available options for this window covering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">Loading options...</div>
        ) : (
          availableOptions.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={() => onOptionToggle(option.id)}
                disabled={option.is_required}
                className="rounded border-gray-300"
              />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{option.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({option.option_type})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      £{option.base_cost} {option.cost_type}
                    </span>
                    {option.is_required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                    )}
                    {option.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
