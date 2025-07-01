
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Group traditional options by type for better organization
  const safeOptions = Array.isArray(options) ? options : [];
  const groupedOptions = safeOptions.reduce((acc: Record<string, any[]>, option: any) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        // Filter options based on current selections
        const filteredOptions = getFilteredOptions(typeOptions);
        
        if (filteredOptions.length === 0) {
          return null;
        }

        return (
          <div key={optionType} className="space-y-3">
            <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
            <div className="space-y-2">
              {filteredOptions.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                
                return (
                  <div key={option.id} className="grid grid-cols-2 gap-4 items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onOptionToggle(option.id)}
                        disabled={option.is_required}
                      />
                      
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
                    <div className="text-right">
                      <Badge variant={isSelected ? "default" : "outline"}>
                        {formatCurrency(option.base_cost, currency)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
