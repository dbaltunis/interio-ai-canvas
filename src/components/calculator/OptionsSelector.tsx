
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { type WindowCoveringOption, type HierarchicalOption } from "@/hooks/useWindowCoveringOptions";

interface OptionsSelectorProps {
  availableOptions: WindowCoveringOption[];
  hierarchicalOptions?: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isLoading: boolean;
}

export const OptionsSelector = ({ 
  availableOptions, 
  hierarchicalOptions = [],
  selectedOptions, 
  onOptionToggle, 
  isLoading 
}: OptionsSelectorProps) => {
  const hasTraditionalOptions = availableOptions.length > 0;
  const hasHierarchicalOptions = hierarchicalOptions.length > 0;

  // Check if motorised option is selected
  const isMotori
Options
sed = () => {
    return availableOptions.some(option => 
      selectedOptions.includes(option.id) && 
      option.name.toLowerCase().includes('motorised')
    );
  };

  // Filter options based on conditions
  const getFilteredOptions = (options: WindowCoveringOption[]) => {
    return options.filter(option => {
      // If this is a "remote" option, only show it when motorised is selected
      if (option.name.toLowerCase().includes('remote')) {
        return isMotorisedSelected();
      }
      return true;
    });
  };

  if (!hasTraditionalOptions && !hasHierarchicalOptions && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No options configured for this window covering.</p>
        </CardContent>
      </Card>
    );
  }

  // Group traditional options by type for better organization
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
          <>
            {/* Traditional Options */}
            {hasTraditionalOptions && Object.entries(groupedOptions).map(([optionType, options]) => {
              // Filter options based on current selections
              const filteredOptions = getFilteredOptions(options);
              
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
              );
            })}

            {/* Hierarchical Options */}
            {hasHierarchicalOptions && hierarchicalOptions.map((category) => (
              <div key={category.id} className="space-y-4">
                <h4 className="font-medium text-brand-primary">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}

                {category.subcategories?.map((subcategory) => (
                  <div key={subcategory.id} className="ml-4 space-y-3">
                    <h5 className="font-medium text-gray-800">{subcategory.name}</h5>
                    
                    {subcategory.sub_subcategories?.map((subSub) => (
                      <div key={subSub.id} className="ml-4 space-y-2">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            id={subSub.id}
                            checked={selectedOptions.includes(subSub.id)}
                            onChange={() => onOptionToggle(subSub.id)}
                            className="rounded border-gray-300"
                          />
                          
                          {subSub.image_url && (
                            <img 
                              src={subSub.image_url} 
                              alt={subSub.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                          
                          <Label htmlFor={subSub.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{subSub.name}</span>
                                {subSub.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{subSub.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                £{subSub.base_price} {subSub.pricing_method}
                              </Badge>
                            </div>
                          </Label>
                        </div>

                        {/* Extras - apply conditional logic */}
                        {subSub.extras?.map((extra) => {
                          // Apply same conditional logic for extras
                          if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected()) {
                            return null;
                          }

                          return (
                            <div key={extra.id} className="ml-6 flex items-center space-x-3 p-2 border rounded-lg bg-gray-50">
                              <input
                                type="checkbox"
                                id={extra.id}
                                checked={selectedOptions.includes(extra.id)}
                                onChange={() => onOptionToggle(extra.id)}
                                disabled={extra.is_required}
                                className="rounded border-gray-300"
                              />
                              
                              {extra.image_url && (
                                <img 
                                  src={extra.image_url} 
                                  alt={extra.name}
                                  className="w-8 h-8 object-cover rounded border"
                                />
                              )}
                              
                              <Label htmlFor={extra.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium">{extra.name}</span>
                                    {extra.description && (
                                      <p className="text-xs text-muted-foreground">{extra.description}</p>
                                    )}
                                    {extra.is_required && <span className="text-xs text-red-600">• Required</span>}
                                    {extra.is_default && <span className="text-xs text-blue-600">• Default</span>}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    £{extra.base_price}
                                  </Badge>
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
