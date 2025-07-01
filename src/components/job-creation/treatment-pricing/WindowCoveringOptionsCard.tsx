

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { useState } from "react";

interface WindowCoveringOptionsCardProps {
  options: any[];
  hierarchicalOptions?: HierarchicalOption[];
  optionsLoading: boolean;
  windowCovering: any;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const WindowCoveringOptionsCard = ({ 
  options, 
  hierarchicalOptions = [],
  optionsLoading, 
  windowCovering, 
  selectedOptions, 
  onOptionToggle 
}: WindowCoveringOptionsCardProps) => {
  const { units } = useMeasurementUnits();
  const [hierarchicalSelections, setHierarchicalSelections] = useState<Record<string, string>>({});

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

  // Check if motorised option is selected
  const isMotorisedSelected = () => {
    return options.some(option => 
      selectedOptions.includes(option.id) && 
      option.name.toLowerCase().includes('motorised')
    ) || Object.values(hierarchicalSelections).some(selection => 
      selection.toLowerCase().includes('motorised')
    );
  };

  // Filter options based on conditions
  const getFilteredOptions = (typeOptions: any[]) => {
    return typeOptions.filter(option => {
      // If this is a "remote" option, only show it when motorised is selected
      if (option.name.toLowerCase().includes('remote')) {
        return isMotorisedSelected();
      }
      return true;
    });
  };

  const handleHierarchicalSelection = (categoryId: string, subcategoryId: string, value: string) => {
    const selectionKey = `${categoryId}_${subcategoryId}`;
    setHierarchicalSelections(prev => ({
      ...prev,
      [selectionKey]: value
    }));
    
    // Also trigger the option toggle for the selected sub-subcategory
    onOptionToggle(value);
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

  const hasTraditionalOptions = options && options.length > 0;
  const hasHierarchicalOptions = hierarchicalOptions && hierarchicalOptions.length > 0;

  if (!hasTraditionalOptions && !hasHierarchicalOptions) {
    return null;
  }

  // Group traditional options by type for better organization
  const safeOptions = Array.isArray(options) ? options : [];
  const groupedOptions = safeOptions.reduce((acc: Record<string, any[]>, option: any) => {
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
      <CardContent className="space-y-6">
        {/* Traditional Options */}
        {hasTraditionalOptions && Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
          // Filter options based on current selections
          const filteredOptions = getFilteredOptions(typeOptions);
          
          if (filteredOptions.length === 0) {
            return null;
          }

          return (
            <div key={optionType} className="space-y-3">
              <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
              <div className="space-y-2">
                {filteredOptions.map((option, index) => {
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
                          {formatCurrency(option.base_cost)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Hierarchical Options - Display as Dropdowns */}
        {hasHierarchicalOptions && hierarchicalOptions.map((category) => (
          <div key={category.id} className="space-y-4">
            <h4 className="font-medium text-brand-primary">{category.name}</h4>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}

            {/* Subcategories as Option Groups */}
            {category.subcategories?.map((subcategory) => (
              <div key={subcategory.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-800">{subcategory.name}</h5>
                  <div className="w-64">
                    <Select
                      value={hierarchicalSelections[`${category.id}_${subcategory.id}`] || ""}
                      onValueChange={(value) => handleHierarchicalSelection(category.id, subcategory.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategory.sub_subcategories?.map((subSub) => (
                          <SelectItem key={subSub.id} value={subSub.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{subSub.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {formatCurrency(subSub.base_price)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show extras for selected sub-subcategory */}
                {hierarchicalSelections[`${category.id}_${subcategory.id}`] && (
                  <div className="ml-4 space-y-2">
                    {subcategory.sub_subcategories?.find(
                      subSub => subSub.id === hierarchicalSelections[`${category.id}_${subcategory.id}`]
                    )?.extras?.map((extra) => {
                      // Apply conditional logic for extras
                      if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected()) {
                        return null;
                      }

                      return (
                        <div key={extra.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedOptions.includes(extra.id)}
                              onCheckedChange={() => onOptionToggle(extra.id)}
                              disabled={extra.is_required}
                            />
                            
                            {extra.image_url && (
                              <img 
                                src={extra.image_url} 
                                alt={extra.name}
                                className="w-8 h-8 object-cover rounded border"
                              />
                            )}
                            
                            <div>
                              <div className="text-sm font-medium">{extra.name}</div>
                              {extra.description && (
                                <div className="text-xs text-gray-600">{extra.description}</div>
                              )}
                              <div className="text-xs text-gray-500">
                                {extra.is_required && <span className="text-red-600">• Required</span>}
                                {extra.is_default && <span className="text-blue-600">• Default</span>}
                              </div>
                            </div>
                          </div>
                          <Badge variant={selectedOptions.includes(extra.id) ? "default" : "outline"} className="text-xs">
                            {formatCurrency(extra.base_price)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

