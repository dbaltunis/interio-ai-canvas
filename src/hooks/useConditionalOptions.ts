import { useMemo } from 'react';
import { useTreatmentOptionRules, OptionRule } from './useOptionRules';

interface SelectedOptions {
  [key: string]: string | string[];
}

export const useConditionalOptions = (templateId?: string, selectedOptions: SelectedOptions = {}) => {
  const { data: rules = [] } = useTreatmentOptionRules(templateId);

  console.log('🔧 useConditionalOptions - Rules:', rules.length);
  console.log('🔧 useConditionalOptions - Selected Options:', selectedOptions);

  const evaluateCondition = (rule: OptionRule): boolean => {
    const { option_key, operator, value } = rule.condition;
    const selectedValue = selectedOptions[option_key];

    console.log(`📊 Evaluating rule: "${option_key}" ${operator} "${value}"`, {
      selectedValue,
      conditionMet: !!selectedValue
    });

    if (!selectedValue) return false;

    let result = false;
    switch (operator) {
      case 'equals':
        result = selectedValue === value;
        break;
      
      case 'not_equals':
        result = selectedValue !== value;
        break;
      
      case 'contains':
        if (Array.isArray(selectedValue)) {
          result = selectedValue.includes(value as string);
        } else {
          result = String(selectedValue).includes(value as string);
        }
        break;
      
      case 'in_list':
        if (Array.isArray(value)) {
          result = value.includes(selectedValue as string);
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

    console.log('🎯 Processing rules with selections:', selectedOptions);

    // First pass: Find all options controlled by "show_option" rules
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
                console.log(`🎯 SETTING DEFAULT for ${target_option_key}: ${target_value}`);
                defaultValues[target_option_key] = target_value;
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
      defaults: defaultValues
    });

    return {
      hiddenOptions: Array.from(hiddenOptions),
      shownOptions: Array.from(shownOptions),
      requiredOptions: Array.from(requiredOptions),
      defaultValues,
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

  return {
    ...conditionalState,
    isOptionVisible,
    isOptionRequired,
    getDefaultValue,
    rules,
  };
};
