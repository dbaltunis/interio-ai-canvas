import { useMemo } from 'react';
import { useTreatmentOptionRules, OptionRule } from './useOptionRules';

interface SelectedOptions {
  [key: string]: string | string[];
}

export const useConditionalOptions = (templateId?: string, selectedOptions: SelectedOptions = {}) => {
  const { data: rules = [] } = useTreatmentOptionRules(templateId);

  console.log('🔧 useConditionalOptions - Rules:', rules.length);
  console.log('🔧 useConditionalOptions - Selected Options:', selectedOptions);

  // ✅ CRITICAL FIX: Normalize comparison to handle UUID vs code/label mismatches
  // Rules may store code ("motorised_track") while selections store UUIDs
  // Also check the corresponding _code key for matching
  const evaluateCondition = (rule: OptionRule): boolean => {
    const { option_key, operator, value } = rule.condition;
    const selectedValue = selectedOptions[option_key];
    // Also check for a code version of the selection (e.g., "hardware_type_code")
    const selectedCode = selectedOptions[`${option_key}_code`];
    // And label version
    const selectedLabel = selectedOptions[`${option_key}_label`];

    console.log(`📊 Evaluating rule: "${option_key}" ${operator} "${value}"`, {
      selectedValue,
      selectedCode,
      selectedLabel,
      conditionMet: !!(selectedValue || selectedCode)
    });

    if (!selectedValue && !selectedCode) return false;

    // Helper to check if any selected value matches a target
    const matchesValue = (target: string): boolean => {
      const targetLower = target?.toString().toLowerCase();
      return (
        selectedValue === target ||
        selectedCode === target ||
        selectedLabel === target ||
        selectedValue?.toString().toLowerCase() === targetLower ||
        selectedCode?.toString().toLowerCase() === targetLower ||
        selectedLabel?.toString().toLowerCase() === targetLower
      );
    };

    let result = false;
    switch (operator) {
      case 'equals':
        result = matchesValue(value as string);
        break;
      
      case 'not_equals':
        result = !matchesValue(value as string);
        break;
      
      case 'contains':
        if (Array.isArray(selectedValue)) {
          result = selectedValue.includes(value as string);
        } else {
          result = String(selectedValue || selectedCode || '').toLowerCase().includes((value as string).toLowerCase());
        }
        break;
      
      case 'in_list':
        if (Array.isArray(value)) {
          // Check if any value in the list matches our selection (by UUID, code, or label)
          result = value.some(v => matchesValue(v));
        }
        break;
      
      default:
        result = false;
    }

    console.log(`✅ Condition result: ${result}`);
    return result;
  };

  const conditionalState = useMemo(() => {
    const hiddenOptions = new Set<string>();
    const shownOptions = new Set<string>();
    const requiredOptions = new Set<string>();
    const defaultValues: Record<string, string> = {};
    const allowedValues: Record<string, Set<string>> = {};

    console.log('🎯 Processing rules with selections:', selectedOptions);

    // First pass: Find all options controlled by "show_option" or "filter_values" rules
    // These should be HIDDEN by default unless their condition is met
    const optionsControlledByShowRules = new Set<string>();
    rules.forEach(rule => {
      if (rule.effect.action === 'show_option') {
        optionsControlledByShowRules.add(rule.effect.target_option_key);
      }
    });

    // Hide all options controlled by show_option rules by default
    optionsControlledByShowRules.forEach(optionKey => {
      hiddenOptions.add(optionKey);
      console.log(`🔒 Default HIDING option controlled by show rule: ${optionKey}`);
    });

    // Cascading evaluation: Keep evaluating until no changes occur
    // This handles nested conditions (e.g., headrail -> lift_system -> chain_side)
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;
      
      console.log(`🔄 Cascade iteration ${iterations}`);

      rules.forEach(rule => {
        const conditionMet = evaluateCondition(rule);
        
        console.log(`📋 Rule "${rule.description || rule.id}":`, {
          conditionMet,
          action: rule.effect.action,
          target: rule.effect.target_option_key,
          iteration: iterations
        });
        
        if (conditionMet) {
          const { action, target_option_key, target_value } = rule.effect;

          switch (action) {
            case 'show_option':
              if (hiddenOptions.has(target_option_key)) {
                console.log(`✅ SHOWING option: ${target_option_key} (iteration ${iterations})`);
                shownOptions.add(target_option_key);
                hiddenOptions.delete(target_option_key);
                hasChanges = true; // Trigger another iteration
              }
              break;
            
            case 'hide_option':
              if (!shownOptions.has(target_option_key) && !hiddenOptions.has(target_option_key)) {
                console.log(`❌ HIDING option: ${target_option_key}`);
                hiddenOptions.add(target_option_key);
                hasChanges = true;
              }
              break;
            
            case 'require_option':
              if (!requiredOptions.has(target_option_key)) {
                console.log(`⚠️ REQUIRING option: ${target_option_key}`);
                requiredOptions.add(target_option_key);
                hasChanges = true;
              }
              // Also show required options
              if (hiddenOptions.has(target_option_key)) {
                shownOptions.add(target_option_key);
                hiddenOptions.delete(target_option_key);
                hasChanges = true;
              }
              break;
            
            case 'set_default':
              if (target_value && !defaultValues[target_option_key]) {
                const defaultVal = Array.isArray(target_value) ? target_value[0] : target_value;
                console.log(`🎯 SETTING DEFAULT for ${target_option_key}: ${defaultVal}`);
                defaultValues[target_option_key] = defaultVal;
                hasChanges = true;
              }
              break;

            case 'filter_values':
              // Filter values within a dropdown - only show specific value IDs
              if (target_value) {
                const values = Array.isArray(target_value) ? target_value : [target_value];
                if (!allowedValues[target_option_key]) {
                  allowedValues[target_option_key] = new Set();
                }
                values.forEach(v => {
                  allowedValues[target_option_key].add(v);
                  console.log(`🔍 FILTERING values for ${target_option_key}: allowing ${v}`);
                });
                hasChanges = true;
              }
              break;
          }
        }
      });
    }

    console.log('📦 Final conditional state after', iterations, 'iterations:', {
      hidden: Array.from(hiddenOptions),
      shown: Array.from(shownOptions),
      required: Array.from(requiredOptions),
      defaults: defaultValues,
      allowedValues: Object.fromEntries(
        Object.entries(allowedValues).map(([k, v]) => [k, Array.from(v)])
      )
    });

    return {
      hiddenOptions: Array.from(hiddenOptions),
      shownOptions: Array.from(shownOptions),
      requiredOptions: Array.from(requiredOptions),
      defaultValues,
      allowedValues: Object.fromEntries(
        Object.entries(allowedValues).map(([k, v]) => [k, Array.from(v)])
      ),
    };
  }, [rules, JSON.stringify(selectedOptions)]);

  const isOptionVisible = (optionKey: string): boolean => {
    return !conditionalState.hiddenOptions.includes(optionKey);
  };

  const isOptionRequired = (optionKey: string): boolean => {
    return conditionalState.requiredOptions.includes(optionKey);
  };

  const getDefaultValue = (optionKey: string): string | undefined => {
    return conditionalState.defaultValues[optionKey];
  };

  const getAllowedValues = (optionKey: string): string[] | null => {
    const allowed = conditionalState.allowedValues?.[optionKey];
    if (allowed && allowed.length > 0) {
      return allowed;
    }
    return null; // null means no filtering, show all
  };

  return {
    ...conditionalState,
    isOptionVisible,
    isOptionRequired,
    getDefaultValue,
    getAllowedValues,
    rules,
  };
};
