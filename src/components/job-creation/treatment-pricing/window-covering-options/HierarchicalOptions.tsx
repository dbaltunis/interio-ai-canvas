
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { formatCurrency } from "./currencyUtils";
import { createOptionFilter } from "./optionFilters";

interface HierarchicalOptionsProps {
  hierarchicalOptions: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
  onHierarchicalSelection: (categoryId: string, subcategoryId: string, value: string) => void;
}

export const HierarchicalOptions = ({ 
  hierarchicalOptions, 
  selectedOptions, 
  onOptionToggle, 
  currency,
  hierarchicalSelections,
  onHierarchicalSelection
}: HierarchicalOptionsProps) => {
  const { isMotorisedSelected } = createOptionFilter(selectedOptions, hierarchicalSelections);

  return (
    <>
      {hierarchicalOptions.map((category) => (
        <div key={category.id} className="space-y-4">
          <h4 className="font-medium text-brand-primary">{category.name}</h4>
          {category.description && (
            <p className="text-sm text-gray-600">{category.description}</p>
          )}

          {/* Apply dropdown pattern to all categories */}
          <div className="space-y-3">
            {category.subcategories?.map((subcategory) => {
              const selectedValue = hierarchicalSelections[`${category.id}_${subcategory.id}`];
              const selectedOption = subcategory.sub_subcategories?.find(s => s.id === selectedValue);
              
              return (
                <div key={subcategory.id} className="space-y-3">
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    <h5 className="font-medium text-foreground">{subcategory.name}</h5>
                    <div className="flex-1">
                      <Select
                        value={selectedValue || ""}
                        onValueChange={(value) => onHierarchicalSelection(category.id, subcategory.id, value)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue>
                            {selectedOption ? (
                              <div className="flex items-center justify-between w-full">
                                <span>{selectedOption.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {formatCurrency(selectedOption.base_price, currency)}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Select {subcategory.name}</span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {subcategory.sub_subcategories?.map((subSub) => (
                            <SelectItem key={subSub.id} value={subSub.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{subSub.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {formatCurrency(subSub.base_price, currency)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                {/* Show sub-subcategory extras only when a sub-subcategory is selected */}
                {hierarchicalSelections[`${category.id}_${subcategory.id}`] && (
                  <div className="ml-4 space-y-2">
                    {subcategory.sub_subcategories?.find(
                      subSub => subSub.id === hierarchicalSelections[`${category.id}_${subcategory.id}`]
                    )?.extras?.map((extra) => {
                      // Apply conditional logic for extras (e.g., remote options only show when motorised is selected)
                      if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected([])) {
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
                            {formatCurrency(extra.base_price, currency)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show conditional subcategories (like Remote options for Motorised) */}
                {category.name.toLowerCase().includes('headrail') && 
                 hierarchicalSelections[`${category.id}_${subcategory.id}`] === 'motorised' && (
                  <div className="space-y-3 ml-4">
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <h5 className="font-medium text-foreground">Remote</h5>
                      <div className="flex-1">
                        <Select
                          value={hierarchicalSelections[`${category.id}_remote`] || ""}
                          onValueChange={(value) => onHierarchicalSelection(category.id, "remote", value)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select remote..." />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="basic_remote">
                              <div className="flex items-center justify-between w-full">
                                <span>Basic Remote</span>
                                <Badge variant="outline" className="ml-2">
                                  {formatCurrency(25, currency)}
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="smart_remote">
                              <div className="flex items-center justify-between w-full">
                                <span>Smart Remote</span>
                                <Badge variant="outline" className="ml-2">
                                  {formatCurrency(50, currency)}
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="app_control">
                              <div className="flex items-center justify-between w-full">
                                <span>App Control</span>
                                <Badge variant="outline" className="ml-2">
                                  {formatCurrency(75, currency)}
                                </Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
