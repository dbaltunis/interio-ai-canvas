import { useMemo, useCallback } from "react";
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
  // Build map of selected option types
  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    options.forEach(opt => {
      if (selectedOptions.includes(opt.id)) {
        map[opt.option_type || opt.name] = opt.id;
      }
    });
    return { ...map, ...hierarchicalSelections };
  }, [selectedOptions, options, hierarchicalSelections]);

  const { isOptionVisible } = useConditionalOptions(templateId, selectedOptionsMap);
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

  // Handle selection change for a type
  const handleSelect = useCallback((optionType: string, newOptionId: string | null) => {
    const previousOptionId = getSelectedForType(optionType);
    onOptionSelect(optionType, newOptionId, previousOptionId);
  }, [getSelectedForType, onOptionSelect]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedOptions).map(([optionType, typeOptions]) => {
        // Filter options based on visibility and enabled state
        const filteredOptions = (typeOptions as any[]).filter((opt: any) => {
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