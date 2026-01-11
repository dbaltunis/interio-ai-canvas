import { useMemo, useCallback } from "react";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { useEnabledTemplateOptions } from "@/hooks/useEnabledTemplateOptions";
import { CascadingOptionSelect } from "@/components/shared/CascadingOptionSelect";

interface TraditionalOptionsProps {
  options: any[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  onOptionSelect?: (newOptionId: string | null, previousOptionId: string | null) => void;
  currency: string;
  hierarchicalSelections: Record<string, string>;
  templateId?: string;
}

export const TraditionalOptions = ({ 
  options, 
  selectedOptions, 
  onOptionToggle,
  onOptionSelect,
  currency,
  hierarchicalSelections,
  templateId
}: TraditionalOptionsProps) => {
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
    console.log('🗺️ TraditionalOptions - selectedOptionsMap:', map);
    return { ...map, ...hierarchicalSelections };
  }, [selectedOptions, options, hierarchicalSelections]);

  const { isOptionVisible } = useConditionalOptions(templateId, selectedOptionsMap);
  const { isOptionEnabled } = useEnabledTemplateOptions(templateId);

  // Build set of disabled option keys (to catch duplicates)
  const disabledKeys = useMemo(() => {
    const keys = new Set<string>();
    options.forEach(opt => {
      if (opt.key && !isOptionEnabled(opt.id)) {
        keys.add(opt.key);
      }
    });
    return keys;
  }, [options, isOptionEnabled]);

  // Group options by type for cascading selection
  const groupedOptions = useMemo(() => {
    return options.reduce((acc: Record<string, any[]>, option) => {
      const optionType = option.option_type || 'other';
      if (!acc[optionType]) {
        acc[optionType] = [];
      }
      acc[optionType].push(option);
      return acc;
    }, {} as Record<string, any[]>);
  }, [options]);

  // Get currently selected option ID for a given type
  const getSelectedForType = useCallback((optionType: string): string | null => {
    const typeOptions = groupedOptions[optionType] || [];
    const selected = typeOptions.find(opt => selectedOptions.includes(opt.id));
    return selected?.id || null;
  }, [groupedOptions, selectedOptions]);

  // Handle cascading selection - deselect previous, select new
  const handleSelect = useCallback((optionType: string, newOptionId: string | null, previousOptionId: string | null) => {
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
  }, [onOptionSelect, onOptionToggle, selectedOptions]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        const filteredOptions = (typeOptions as any[]).filter((opt: any) => {
          // Hide if option key is disabled (catches all duplicates with same key)
          if (opt.key && disabledKeys.has(opt.key)) {
            return false;
          }
          
          const visible = isOptionVisible(opt.key || opt.option_type || opt.name || opt.id);
          const enabled = isOptionEnabled(opt.id);
          return visible && enabled;
        });
        
        if (filteredOptions.length === 0) {
          return null;
        }

        const selectedId = getSelectedForType(optionType);

        return (
          <CascadingOptionSelect
            key={optionType}
            label={optionType}
            options={filteredOptions}
            selectedId={selectedId}
            onSelect={(newId, prevId) => handleSelect(optionType, newId, prevId)}
            currency={currency}
          />
        );
      })}
    </div>
  );
};
