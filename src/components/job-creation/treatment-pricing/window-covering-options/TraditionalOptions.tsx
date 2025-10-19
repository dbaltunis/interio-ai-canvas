import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "./currencyUtils";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { useMemo } from "react";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";

interface TraditionalOptionsProps {
  options: any[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
  templateId?: string;
}

export const TraditionalOptions = ({ 
  options, 
  selectedOptions, 
  onOptionToggle, 
  currency,
  hierarchicalSelections,
  templateId
}: TraditionalOptionsProps) => {
  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    options.forEach(opt => {
      if (selectedOptions.includes(opt.id)) {
        map[opt.option_type || opt.name] = opt.id;
      }
    });
    return { ...map, ...hierarchicalSelections };
  }, [selectedOptions, options, hierarchicalSelections]);

  const { isOptionVisible } = useConditionalOptions(templateId, selectedOptionsMap);

  // Group options by type for better organization
  const groupedOptions = options.reduce((acc: Record<string, any[]>, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        const filteredOptions = (typeOptions as any[]).filter((opt: any) => 
          isOptionVisible(opt.key || opt.option_type || opt.name || opt.id)
        );
        
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
                          {formatCurrency(getOptionPrice(option), currency)} {getOptionPricingMethod(option)}
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
