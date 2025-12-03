
import { useState, useEffect, useCallback } from "react";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";

export const useHierarchicalSelections = (hierarchicalOptions: HierarchicalOption[] = []) => {
  const [hierarchicalSelections, setHierarchicalSelections] = useState<Record<string, string>>({});

  // Auto-select first option in each subcategory, or single option immediately
  useEffect(() => {
    if (hierarchicalOptions.length === 0) return;
    
    const newSelections: Record<string, string> = {};
    let hasChanges = false;
    
    hierarchicalOptions.forEach(category => {
      category.subcategories?.forEach(subcategory => {
        const selectionKey = `${category.id}_${subcategory.id}`;
        const currentSelection = hierarchicalSelections[selectionKey];
        const subSubOptions = subcategory.sub_subcategories || [];
        
        // Auto-select if only one option OR if no selection and options exist
        if (subSubOptions.length === 1 && !currentSelection) {
          // Single option - always auto-select
          newSelections[selectionKey] = subSubOptions[0].id;
          hasChanges = true;
          console.log(`✅ Auto-selected single option for ${subcategory.name}:`, subSubOptions[0].name);
        } else if (subSubOptions.length > 0 && !currentSelection) {
          // Multiple options - auto-select first
          newSelections[selectionKey] = subSubOptions[0].id;
          hasChanges = true;
          console.log(`✅ Auto-selected first option for ${subcategory.name}:`, subSubOptions[0].name);
        }
      });
    });
    
    if (hasChanges) {
      setHierarchicalSelections(prev => ({ ...prev, ...newSelections }));
    }
  }, [hierarchicalOptions]);

  const handleHierarchicalSelection = useCallback((
    categoryId: string, 
    subcategoryId: string, 
    value: string, 
    onOptionToggle: (optionId: string) => void
  ) => {
    const selectionKey = `${categoryId}_${subcategoryId}`;
    
    setHierarchicalSelections(prev => {
      const newSelections = { ...prev, [selectionKey]: value };
      console.log(`🎯 Hierarchical selection updated: ${selectionKey} = ${value}`);
      return newSelections;
    });
    
    // Also trigger the option toggle for the selected sub-subcategory
    onOptionToggle(value);
  }, []);

  return {
    hierarchicalSelections,
    handleHierarchicalSelection,
    setHierarchicalSelections
  };
};
