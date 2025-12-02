import { useMemo, useCallback } from "react";
import { type HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { CascadingOptionSelect } from "@/components/shared/CascadingOptionSelect";
import { ExtraOptionCard } from "./ExtraOptionCard";

interface HierarchicalOptionsSectionProps {
  hierarchicalOptions: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  onOptionSelect?: (newOptionId: string | null, previousOptionId: string | null) => void;
  isMotorisedSelected: () => boolean;
  hierarchicalSelections?: Record<string, string>;
  onHierarchicalSelection?: (categoryId: string, subcategoryId: string, value: string) => void;
  currency?: string;
}

export const HierarchicalOptionsSection = ({ 
  hierarchicalOptions, 
  selectedOptions, 
  onOptionToggle,
  onOptionSelect,
  isMotorisedSelected,
  hierarchicalSelections = {},
  onHierarchicalSelection,
  currency = 'NZD'
}: HierarchicalOptionsSectionProps) => {
  
  // Handle cascading selection for sub-subcategories
  const handleSubSubSelect = useCallback((
    categoryId: string, 
    subcategoryId: string, 
    newOptionId: string | null, 
    previousOptionId: string | null
  ) => {
    if (onHierarchicalSelection && newOptionId) {
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
                        if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected()) {
                          return null;
                        }

                        return (
                          <ExtraOptionCard
                            key={extra.id}
                            extra={{
                              id: extra.id,
                              name: extra.name,
                              description: extra.description,
                              base_price: extra.base_price,
                              image_url: extra.image_url,
                              is_required: extra.is_required || false,
                              is_default: extra.is_default
                            }}
                            isSelected={selectedOptions.includes(extra.id)}
                            onToggle={() => onOptionToggle(extra.id)}
                          />
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
