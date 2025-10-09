import { useMemo } from 'react';
import { useTreatmentOptionRules, OptionRule } from './useOptionRules';

interface SelectedOptions {
  [key: string]: string | string[];
}

export const useConditionalOptions = (templateId?: string, selectedOptions: SelectedOptions = {}) => {
  const { data: rules = [] } = useTreatmentOptionRules(templateId);

  const evaluateCondition = (rule: OptionRule): boolean => {
    const { option_key, operator, value } = rule.condition;
    const selectedValue = selectedOptions[option_key];

    if (!selectedValue) return false;

    switch (operator) {
      case 'equals':
        return selectedValue === value;
      
      case 'not_equals':
        return selectedValue !== value;
      
      case 'contains':
        if (Array.isArray(selectedValue)) {
          return selectedValue.includes(value as string);
        }
        return String(selectedValue).includes(value as string);
      
      case 'in_list':
        if (Array.isArray(value)) {
          return value.includes(selectedValue as string);
        }
        return false;
      
      default:
        return false;
    }
  };

  const conditionalState = useMemo(() => {
    const hiddenOptions = new Set<string>();
    const shownOptions = new Set<string>();
    const requiredOptions = new Set<string>();
    const defaultValues: Record<string, string> = {};

    rules.forEach(rule => {
      const conditionMet = evaluateCondition(rule);
      
      if (conditionMet) {
        const { action, target_option_key, target_value } = rule.effect;

        switch (action) {
          case 'show_option':
            shownOptions.add(target_option_key);
            hiddenOptions.delete(target_option_key);
            break;
          
          case 'hide_option':
            if (!shownOptions.has(target_option_key)) {
              hiddenOptions.add(target_option_key);
            }
            break;
          
          case 'require_option':
            requiredOptions.add(target_option_key);
            break;
          
          case 'set_default':
            if (target_value) {
              defaultValues[target_option_key] = target_value;
            }
            break;
        }
      }
    });

    return {
      hiddenOptions: Array.from(hiddenOptions),
      shownOptions: Array.from(shownOptions),
      requiredOptions: Array.from(requiredOptions),
      defaultValues,
    };
  }, [rules, selectedOptions]);

  const isOptionVisible = (optionKey: string): boolean => {
    return !conditionalState.hiddenOptions.includes(optionKey);
  };

  const isOptionRequired = (optionKey: string): boolean => {
    return conditionalState.requiredOptions.includes(optionKey);
  };

  const getDefaultValue = (optionKey: string): string | undefined => {
    return conditionalState.defaultValues[optionKey];
  };

  return {
    ...conditionalState,
    isOptionVisible,
    isOptionRequired,
    getDefaultValue,
    rules,
  };
};
