import { useMemo, useCallback, useEffect, useRef } from "react";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { useEnabledTemplateOptions } from "@/hooks/useEnabledTemplateOptions";
import { CascadingOptionSelector } from "./CascadingOptionSelector";

interface CascadingTraditionalOptionsProps {
  options: any[];
  selectedOptions: string[];
  onOptionSelect: (optionType: string, optionId: string | null, previousOptionId: string | null) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
  templateId?: string;
}

export const CascadingTraditionalOptions = ({ 
  options, 
  selectedOptions, 
  onOptionSelect, 
  currency,
  hierarchicalSelections,
  templateId
}: CascadingTraditionalOptionsProps) => {
  const autoSelectedTypes = useRef<Set<string>>(new Set());

  // Build map of selected option types - use 'key' for rule matching
  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    options.forEach(opt => {
      if (selectedOptions.includes(opt.id)) {
        // Use opt.key for rule matching (e.g., "control_system"), fall back to option_type or name
        const key = opt.key || opt.option_type || opt.name;
        map[key] = opt.id;
      }
    });
    console.log('🗺️ CascadingTraditionalOptions - selectedOptionsMap:', map);
    return { ...map, ...hierarchicalSelections };
  }, [selectedOptions, options, hierarchicalSelections]);

  const { isOptionVisible, getAllowedValues } = useConditionalOptions(templateId, selectedOptionsMap);
  const { isOptionEnabled } = useEnabledTemplateOptions(templateId);

  // Build set of disabled option keys
  const disabledKeys = useMemo(() => {
    const keys = new Set<string>();
    options.forEach(opt => {
      if (opt.key && !isOptionEnabled(opt.id)) {
        keys.add(opt.key);
      }
    });
    return keys;
  }, [options, isOptionEnabled]);

  // Group options by type
  const groupedOptions = useMemo(() => {
    return options.reduce((acc: Record<string, any[]>, option) => {
      const type = option.option_type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(option);
      return acc;
    }, {} as Record<string, any[]>);
  }, [options]);

  // Get filtered options for a type, including value-level filtering
  const getFilteredOptionsForType = useCallback((optionType: string) => {
    const typeOptions = groupedOptions[optionType] || [];
    
    // First filter by visibility and enabled state
    let filtered = typeOptions.filter((opt: any) => {
      if (opt.key && disabledKeys.has(opt.key)) {
        return false;
      }
      const visible = isOptionVisible(opt.key || opt.option_type || opt.name || opt.id);
      const enabled = isOptionEnabled(opt.id);
      return visible && enabled;
    });
    
    // Then apply value-level filtering if rules specify allowed values for this option type
    // Check both the optionType (label) and the key (lowercase)
    const optionKey = typeOptions[0]?.key || optionType.toLowerCase().replace(/\s+/g, '_');
    const allowedValuesForType = getAllowedValues(optionType) || getAllowedValues(optionKey);
    if (allowedValuesForType && allowedValuesForType.length > 0) {
      console.log(`🔍 Filtering ${optionType} (key: ${optionKey}) to allowed values:`, allowedValuesForType);
      filtered = filtered.filter((opt: any) => allowedValuesForType.includes(opt.id));
    }
    
    return filtered;
  }, [groupedOptions, disabledKeys, isOptionVisible, isOptionEnabled, getAllowedValues]);

  // Get currently selected option ID for a given type
  const getSelectedForType = useCallback((optionType: string): string | null => {
    const typeOptions = groupedOptions[optionType] || [];
    for (const opt of typeOptions) {
      if (selectedOptions.includes(opt.id)) {
        return opt.id;
      }
    }
    return null;
  }, [groupedOptions, selectedOptions]);

  // Auto-select single options for each type
  useEffect(() => {
    Object.keys(groupedOptions).forEach(optionType => {
      // Skip if already auto-selected this type
      if (autoSelectedTypes.current.has(optionType)) return;
      
      const filteredOptions = getFilteredOptionsForType(optionType);
      const currentSelection = getSelectedForType(optionType);
      
      // Auto-select if single option and none selected
      if (filteredOptions.length === 1 && !currentSelection) {
        console.log(`✅ Auto-selecting single traditional option for ${optionType}:`, filteredOptions[0].name);
        autoSelectedTypes.current.add(optionType);
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          onOptionSelect(optionType, filteredOptions[0].id, null);
        }, 0);
      }
    });
  }, [groupedOptions, getFilteredOptionsForType, getSelectedForType, onOptionSelect]);

  // Reset auto-selection tracking when options change
  useEffect(() => {
    const optionIds = options.map(o => o.id).join(',');
    return () => {
      autoSelectedTypes.current.clear();
    };
  }, [options.length]);

  // Handle selection change for a type
  const handleSelect = useCallback((optionType: string, newOptionId: string | null) => {
    const previousOptionId = getSelectedForType(optionType);
    onOptionSelect(optionType, newOptionId, previousOptionId);
  }, [getSelectedForType, onOptionSelect]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        // Use the shared filtering function (includes value-level filtering)
        const filteredOptions = getFilteredOptionsForType(optionType);
        
        if (filteredOptions.length === 0) {
          return null;
        }

        const selectedId = getSelectedForType(optionType);

        return (
          <CascadingOptionSelector
            key={optionType}
            optionType={optionType}
            options={filteredOptions}
            selectedOptionId={selectedId}
            onSelect={(newId) => handleSelect(optionType, newId)}
            currency={currency}
          />
        );
      })}
    </div>
  );
};
