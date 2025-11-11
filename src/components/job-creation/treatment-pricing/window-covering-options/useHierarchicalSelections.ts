
import { useState, useEffect } from "react";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";

export const useHierarchicalSelections = (hierarchicalOptions: HierarchicalOption[] = []) => {
  const [hierarchicalSelections, setHierarchicalSelections] = useState<Record<string, string>>({});

  // Auto-select first option in each subcategory
  useEffect(() => {
    if (hierarchicalOptions.length > 0 && Object.keys(hierarchicalSelections).length === 0) {
      const initialSelections: Record<string, string> = {};
      
      hierarchicalOptions.forEach(category => {
        category.subcategories?.forEach(subcategory => {
          const selectionKey = `${category.id}_${subcategory.id}`;
          const firstOption = subcategory.sub_subcategories?.[0];
          if (firstOption) {
            initialSelections[selectionKey] = firstOption.id;
          }
        });
      });
      
      if (Object.keys(initialSelections).length > 0) {
        setHierarchicalSelections(initialSelections);
      }
    }
  }, [hierarchicalOptions, hierarchicalSelections]);

  const handleHierarchicalSelection = (categoryId: string, subcategoryId: string, value: string, onOptionToggle: (optionId: string) => void) => {
    const selectionKey = `${categoryId}_${subcategoryId}`;
    setHierarchicalSelections(prev => ({
      ...prev,
      [selectionKey]: value
    }));
    
    // Also trigger the option toggle for the selected sub-subcategory
    onOptionToggle(value);
  };

  return {
    hierarchicalSelections,
    handleHierarchicalSelection
  };
};
