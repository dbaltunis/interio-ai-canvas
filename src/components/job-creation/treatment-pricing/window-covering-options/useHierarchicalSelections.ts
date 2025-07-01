
import { useState } from "react";

export const useHierarchicalSelections = () => {
  const [hierarchicalSelections, setHierarchicalSelections] = useState<Record<string, string>>({});

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
