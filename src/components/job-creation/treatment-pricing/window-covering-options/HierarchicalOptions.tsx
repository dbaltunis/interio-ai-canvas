import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { formatCurrency } from "./currencyUtils";
import { createOptionFilter } from "./optionFilters";
import { CascadingOptionSelect } from "@/components/shared/CascadingOptionSelect";

interface HierarchicalOptionsProps {
  hierarchicalOptions: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  onOptionSelect?: (newOptionId: string | null, previousOptionId: string | null) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
  onHierarchicalSelection: (categoryId: string, subcategoryId: string, value: string) => void;
}

export const HierarchicalOptions = ({ 
  hierarchicalOptions, 
  selectedOptions, 
  onOptionToggle,
  onOptionSelect,
  currency,
  hierarchicalSelections,
  onHierarchicalSelection
}: HierarchicalOptionsProps) => {
  const { isMotorisedSelected } = createOptionFilter(selectedOptions, hierarchicalSelections);

  // Handle cascading selection for sub-subcategories
  const handleSubSubSelect = useCallback((
    categoryId: string, 
    subcategoryId: string, 
    newOptionId: string | null, 
    previousOptionId: string | null
  ) => {
    if (newOptionId) {
      onHierarchicalSelection(categoryId, subcategoryId, newOptionId);
    }
    
    if (onOptionSelect) {
      onOptionSelect(newOptionId, previousOptionId);
    } else {
      // Fallback to toggle behavior
      if (previousOptionId && selectedOptions.includes(previousOptionId)) {
        onOptionToggle(previousOptionId);
      }
      if (newOptionId && !selectedOptions.includes(newOptionId)) {
        onOptionToggle(newOptionId);
      }
    }
  }, [onHierarchicalSelection, onOptionSelect, onOptionToggle, selectedOptions]);

  return (
    <div className="space-y-6">
      {hierarchicalOptions.map((category) => (
        <div key={category.id} className="space-y-4">
          <h4 className="font-medium text-brand-primary">{category.name}</h4>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}

          <div className="space-y-4">
            {category.subcategories?.map((subcategory) => {
              const selectionKey = `${category.id}_${subcategory.id}`;
              const selectedSubSubId = hierarchicalSelections[selectionKey] || null;
              
              // Convert sub_subcategories to option format
              const subSubOptions = (subcategory.sub_subcategories || []).map(subSub => ({
                id: subSub.id,
                name: subSub.name,
                description: subSub.description,
                base_price: subSub.base_price,
                pricing_method: subSub.pricing_method,
                image_url: subSub.image_url
              }));

              // Find selected sub-subcategory for showing extras
              const selectedSubSub = subcategory.sub_subcategories?.find(
                s => s.id === selectedSubSubId
              );

              return (
                <div key={subcategory.id} className="space-y-3">
                  <CascadingOptionSelect
                    label={subcategory.name}
                    options={subSubOptions}
                    selectedId={selectedSubSubId}
                    onSelect={(newId, prevId) => handleSubSubSelect(category.id, subcategory.id, newId, prevId)}
                    currency={currency}
                  />

                  {/* Show extras for selected sub-subcategory */}
                  {selectedSubSub?.extras && selectedSubSub.extras.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {selectedSubSub.extras.map((extra) => {
                        // Apply conditional logic for extras
                        if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected([])) {
                          return null;
                        }

                        return (
                          <div key={extra.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
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
                                  <div className="text-xs text-muted-foreground">{extra.description}</div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {extra.is_required && <span className="text-destructive">• Required</span>}
                                  {extra.is_default && <span className="text-primary">• Default</span>}
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
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
