import { useState, useEffect, useCallback, useRef } from "react";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";

export const useHierarchicalSelections = (
  hierarchicalOptions: HierarchicalOption[] = [],
  onOptionToggle?: (optionId: string) => void
) => {
  const [hierarchicalSelections, setHierarchicalSelections] = useState<Record<string, string>>({});
  const autoSelectedRef = useRef<Set<string>>(new Set());

  // Auto-select first option in each subcategory, or single option immediately
  useEffect(() => {
    if (hierarchicalOptions.length === 0) return;
    
    const newSelections: Record<string, string> = {};
    const optionsToToggle: string[] = [];
    
    hierarchicalOptions.forEach(category => {
      category.subcategories?.forEach(subcategory => {
        const selectionKey = `${category.id}_${subcategory.id}`;
        const currentSelection = hierarchicalSelections[selectionKey];
        const subSubOptions = subcategory.sub_subcategories || [];
        
        // Skip if already auto-selected this key
        if (autoSelectedRef.current.has(selectionKey)) return;
        
        // Auto-select if only one option OR if no selection and options exist
        if (subSubOptions.length === 1 && !currentSelection) {
          // Single option - always auto-select
          newSelections[selectionKey] = subSubOptions[0].id;
          optionsToToggle.push(subSubOptions[0].id);
          autoSelectedRef.current.add(selectionKey);
          console.log(`✅ Auto-selected single option for ${subcategory.name}:`, subSubOptions[0].name);
        } else if (subSubOptions.length > 0 && !currentSelection) {
          // Multiple options - auto-select first
          newSelections[selectionKey] = subSubOptions[0].id;
          optionsToToggle.push(subSubOptions[0].id);
          autoSelectedRef.current.add(selectionKey);
          console.log(`✅ Auto-selected first option for ${subcategory.name}:`, subSubOptions[0].name);
        }
      });
    });
    
    if (Object.keys(newSelections).length > 0) {
      setHierarchicalSelections(prev => ({ ...prev, ...newSelections }));
      
      // Also trigger onOptionToggle to record values
      if (onOptionToggle) {
        optionsToToggle.forEach(optionId => {
          onOptionToggle(optionId);
        });
      }
    }
  }, [hierarchicalOptions, onOptionToggle]);

  // Reset auto-selected tracking when options change significantly
  useEffect(() => {
    const optionIds = hierarchicalOptions.flatMap(c => 
      c.subcategories?.flatMap(s => s.sub_subcategories?.map(ss => ss.id) || []) || []
    ).join(',');
    
    // Clear tracking if options changed
    return () => {
      autoSelectedRef.current.clear();
    };
  }, [hierarchicalOptions.length]);

  const handleHierarchicalSelection = useCallback((
    categoryId: string, 
    subcategoryId: string, 
    value: string, 
    onToggle: (optionId: string) => void
  ) => {
    const selectionKey = `${categoryId}_${subcategoryId}`;
    
    setHierarchicalSelections(prev => {
      const previousValue = prev[selectionKey];
      
      // Deselect previous if different
      if (previousValue && previousValue !== value) {
        onToggle(previousValue);
      }
      
      const newSelections = { ...prev, [selectionKey]: value };
      console.log(`🎯 Hierarchical selection updated: ${selectionKey} = ${value}`);
      return newSelections;
    });
    
    // Select the new value
    onToggle(value);
  }, []);

  return {
    hierarchicalSelections,
    handleHierarchicalSelection,
    setHierarchicalSelections
  };
};
