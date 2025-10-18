import { useTreatmentOptionRules, OptionRule } from './useOptionRules';

interface RuleEvaluationResult {
  visibleOptions: string[];
  requiredOptions: string[];
  defaultValues: Record<string, any>;
  isLoading: boolean;
}

/**
 * Evaluates option rules for a given template and returns visibility/requirements/defaults
 */
export const useOptionRulesEngine = (
  templateId: string | undefined,
  currentMeasurements: Record<string, any>,
  selectedOptions: Record<string, any>
): RuleEvaluationResult => {
  const { data: rules, isLoading } = useTreatmentOptionRules(templateId);

  // Evaluate a single condition
  const evaluateCondition = (rule: OptionRule): boolean => {
    const { option_key, operator, value } = rule.condition;
    const currentValue = currentMeasurements[option_key] || selectedOptions[option_key];

    console.log('🔍 Evaluating rule condition:', {
      option_key,
      operator,
      ruleValue: value,
      currentValue,
      rule: rule.id
    });

    switch (operator) {
      case 'equals':
        return currentValue === value;
      case 'not_equals':
        return currentValue !== value;
      case 'contains':
        if (typeof currentValue === 'string' && typeof value === 'string') {
          return currentValue.includes(value);
        }
        return false;
      case 'in_list':
        if (Array.isArray(value)) {
          return value.includes(currentValue);
        }
        return false;
      default:
        console.warn('Unknown operator:', operator);
        return false;
    }
  };

  // Apply effects from rules
  const visibleOptions = new Set<string>();
  const requiredOptions = new Set<string>();
  const defaultValues: Record<string, any> = {};

  // Evaluate each rule
  rules?.forEach(rule => {
    const conditionMet = evaluateCondition(rule);
    
    if (conditionMet) {
      const { action, target_option_key, target_value } = rule.effect;
      
      console.log('✅ Rule condition met, applying effect:', {
        action,
        target_option_key,
        target_value,
        rule: rule.id
      });

      switch (action) {
        case 'show_option':
          visibleOptions.add(target_option_key);
          break;
        case 'hide_option':
          visibleOptions.delete(target_option_key);
          break;
        case 'require_option':
          requiredOptions.add(target_option_key);
          break;
        case 'set_default':
          if (target_value !== undefined) {
            defaultValues[target_option_key] = target_value;
          }
          break;
        default:
          console.warn('Unknown action:', action);
      }
    }
  });

  console.log('🎯 Option rules evaluation result:', {
    templateId,
    rulesCount: rules?.length || 0,
    visibleOptions: Array.from(visibleOptions),
    requiredOptions: Array.from(requiredOptions),
    defaultValues
  });

  return {
    visibleOptions: Array.from(visibleOptions),
    requiredOptions: Array.from(requiredOptions),
    defaultValues,
    isLoading
  };
};
