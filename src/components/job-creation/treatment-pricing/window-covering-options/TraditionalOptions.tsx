
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "./currencyUtils";
import { createOptionFilter } from "./optionFilters";

interface TraditionalOptionsProps {
  options: any[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
}

export const TraditionalOptions = ({ 
  options, 
  selectedOptions, 
  onOptionToggle, 
  currency,
  hierarchicalSelections 
}: TraditionalOptionsProps) => {
  const { getFilteredOptions } = createOptionFilter(selectedOptions, hierarchicalSelections);

  // Group options by type for better organization
  const groupedOptions = options.reduce((acc: Record<string, any[]>, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        const filteredOptions = getFilteredOptions(typeOptions);
        
        if (filteredOptions.length === 0) {
          return null;
        }

        return (
          <div key={optionType} className="space-y-3">
            <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
            <div className="grid grid-cols-1 gap-3">
              {filteredOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => onOptionToggle(option.id)}
                    disabled={option.is_required}
                    className="rounded border-gray-300"
                  />
                  
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
                          {formatCurrency(option.base_cost, currency)} {option.cost_type}
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
        );
      })}
    </>
  );
};
