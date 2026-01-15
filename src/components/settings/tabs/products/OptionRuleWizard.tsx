import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { OptionValuePicker } from './OptionValuePicker';
import { TreatmentOption, OptionValue } from '@/hooks/useTreatmentOptions';
import { OptionRule } from '@/hooks/useOptionRules';

interface OptionRuleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  options: TreatmentOption[];
  existingRule?: OptionRule | null;
  onSave: (rule: Omit<OptionRule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals', description: 'Exact match' },
  { value: 'not_equals', label: 'Not Equals', description: 'Does not match' },
  { value: 'contains', label: 'Contains', description: 'Includes text' },
  { value: 'in_list', label: 'In List', description: 'Matches any of multiple values' },
];

const ACTIONS = [
  { value: 'show_option', label: 'Show Option', description: 'Make visible', icon: '👁️' },
  { value: 'hide_option', label: 'Hide Option', description: 'Hide from view', icon: '🙈' },
  { value: 'require_option', label: 'Require Option', description: 'Mark as required', icon: '⚠️' },
  { value: 'set_default', label: 'Set Default', description: 'Pre-select a value', icon: '✓' },
  { value: 'filter_values', label: 'Filter Values', description: 'Limit available choices', icon: '🔽' },
];

export const OptionRuleWizard = ({
  open,
  onOpenChange,
  templateId,
  options,
  existingRule,
  onSave,
  isLoading,
}: OptionRuleWizardProps) => {
  // Form state
  const [conditionOptionKey, setConditionOptionKey] = useState('');
  const [conditionOperator, setConditionOperator] = useState<'equals' | 'not_equals' | 'contains' | 'in_list'>('equals');
  const [conditionValue, setConditionValue] = useState<string | string[]>('');
  const [effectAction, setEffectAction] = useState<'show_option' | 'hide_option' | 'require_option' | 'set_default' | 'filter_values'>('show_option');
  const [targetOptionKey, setTargetOptionKey] = useState('');
  const [targetValue, setTargetValue] = useState<string | string[]>('');
  const [description, setDescription] = useState('');

  // Reset form when dialog opens/closes or when editing different rule
  useEffect(() => {
    if (open) {
      if (existingRule) {
        setConditionOptionKey(existingRule.condition.option_key);
        setConditionOperator(existingRule.condition.operator);
        setConditionValue(existingRule.condition.value);
        setEffectAction(existingRule.effect.action);
        setTargetOptionKey(existingRule.effect.target_option_key);
        setTargetValue(existingRule.effect.target_value || '');
        setDescription(existingRule.description || '');
      } else {
        setConditionOptionKey('');
        setConditionOperator('equals');
        setConditionValue('');
        setEffectAction('show_option');
        setTargetOptionKey('');
        setTargetValue('');
        setDescription('');
      }
    }
  }, [open, existingRule]);

  // Get option values for condition option
  const conditionOption = useMemo(() => 
    options.find(opt => opt.key === conditionOptionKey),
    [options, conditionOptionKey]
  );
  const conditionValues = conditionOption?.option_values || [];

  // Get option values for target option
  const targetOption = useMemo(() => 
    options.find(opt => opt.key === targetOptionKey),
    [options, targetOptionKey]
  );
  const targetValues = targetOption?.option_values || [];

  // Filter out condition option from target options
  const availableTargetOptions = useMemo(() => 
    options.filter(opt => opt.key !== conditionOptionKey),
    [options, conditionOptionKey]
  );

  // Helper to get label from option key
  const getOptionLabel = (key: string) => 
    options.find(opt => opt.key === key)?.label || key;

  // Helper to get value label from option values
  const getValueLabel = (optionKey: string, valueCode: string) => {
    const opt = options.find(o => o.key === optionKey);
    const val = opt?.option_values?.find(v => v.code === valueCode || v.id === valueCode);
    return val?.label || valueCode;
  };

  // Generate preview description
  const previewDescription = useMemo(() => {
    if (!conditionOptionKey || !targetOptionKey) return '';
    
    const conditionLabel = getOptionLabel(conditionOptionKey);
    const targetLabel = getOptionLabel(targetOptionKey);
    const actionLabel = ACTIONS.find(a => a.value === effectAction)?.label || effectAction;
    
    let valueDisplay = '';
    if (Array.isArray(conditionValue)) {
      valueDisplay = conditionValue.map(v => getValueLabel(conditionOptionKey, v)).join(', ');
    } else if (conditionValue) {
      valueDisplay = getValueLabel(conditionOptionKey, conditionValue);
    }
    
    let targetValueDisplay = '';
    if (effectAction === 'set_default' || effectAction === 'filter_values') {
      if (Array.isArray(targetValue)) {
        targetValueDisplay = ` to [${targetValue.map(v => getValueLabel(targetOptionKey, v)).join(', ')}]`;
      } else if (targetValue) {
        targetValueDisplay = ` to "${getValueLabel(targetOptionKey, targetValue)}"`;
      }
    }
    
    const operatorLabel = OPERATORS.find(o => o.value === conditionOperator)?.label?.toLowerCase() || conditionOperator;
    
    return `When "${conditionLabel}" ${operatorLabel} "${valueDisplay}", ${actionLabel.toLowerCase()} "${targetLabel}"${targetValueDisplay}`;
  }, [conditionOptionKey, conditionOperator, conditionValue, effectAction, targetOptionKey, targetValue, options]);

  // Validation
  const isValid = useMemo(() => {
    if (!conditionOptionKey || !targetOptionKey) return false;
    if (!conditionValue || (Array.isArray(conditionValue) && conditionValue.length === 0)) return false;
    if ((effectAction === 'set_default' || effectAction === 'filter_values') && 
        (!targetValue || (Array.isArray(targetValue) && targetValue.length === 0))) {
      return false;
    }
    return true;
  }, [conditionOptionKey, conditionValue, effectAction, targetOptionKey, targetValue]);

  const handleSave = async () => {
    const rule: Omit<OptionRule, 'id' | 'created_at' | 'updated_at'> = {
      template_id: templateId,
      condition: {
        option_key: conditionOptionKey,
        operator: conditionOperator,
        value: conditionValue,
      },
      effect: {
        action: effectAction,
        target_option_key: targetOptionKey,
        ...(effectAction === 'set_default' || effectAction === 'filter_values' 
          ? { target_value: targetValue } 
          : {}),
      },
      description: previewDescription || description,
    };
    
    await onSave(rule);
    onOpenChange(false);
  };

  // Determine if we need target value picker
  const needsTargetValue = effectAction === 'set_default' || effectAction === 'filter_values';
  const targetValueMode = effectAction === 'filter_values' ? 'multi' : 'single';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {existingRule ? 'Edit Conditional Rule' : 'Create Conditional Rule'}
          </DialogTitle>
          <DialogDescription>
            Define when an option should change based on another option's value
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Condition */}
          <Card className="p-4 border-2 border-muted">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Badge variant="outline">1</Badge>
                WHEN this happens...
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Option</Label>
                  <Select value={conditionOptionKey} onValueChange={(v) => {
                    setConditionOptionKey(v);
                    setConditionValue(''); // Reset value when option changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(opt => (
                        <SelectItem key={opt.id} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select 
                    value={conditionOperator} 
                    onValueChange={(v) => setConditionOperator(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          <div className="flex items-center gap-2">
                            <span>{op.label}</span>
                            <span className="text-xs text-muted-foreground">({op.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Condition Value */}
              <div className="space-y-2">
                <Label>Value</Label>
                {conditionValues.length > 0 ? (
                  conditionOperator === 'in_list' ? (
                    <OptionValuePicker
                      values={conditionValues}
                      selectedValues={Array.isArray(conditionValue) ? conditionValue : conditionValue ? [conditionValue] : []}
                      onChange={(ids) => setConditionValue(ids)}
                      mode="multi"
                    />
                  ) : (
                    <Select 
                      value={typeof conditionValue === 'string' ? conditionValue : ''} 
                      onValueChange={setConditionValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select value..." />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionValues.map(val => (
                          <SelectItem key={val.id} value={val.code}>
                            {val.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                ) : (
                  <Input
                    value={typeof conditionValue === 'string' ? conditionValue : ''}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="Enter value..."
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Step 2: Effect */}
          <Card className="p-4 border-2 border-muted">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Badge variant="outline">2</Badge>
                THEN do this...
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select 
                    value={effectAction} 
                    onValueChange={(v) => {
                      setEffectAction(v as any);
                      setTargetValue(''); // Reset target value when action changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            <span>{action.icon}</span>
                            <span>{action.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ACTIONS.find(a => a.value === effectAction)?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Target Option</Label>
                  <Select 
                    value={targetOptionKey} 
                    onValueChange={(v) => {
                      setTargetOptionKey(v);
                      setTargetValue(''); // Reset target value when option changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargetOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Value Picker (for set_default and filter_values) */}
              {needsTargetValue && targetOptionKey && (
                <div className="pt-2">
                  <OptionValuePicker
                    values={targetValues}
                    selectedValues={Array.isArray(targetValue) ? targetValue : targetValue ? [targetValue] : []}
                    onChange={(ids) => setTargetValue(targetValueMode === 'multi' ? ids : ids[0] || '')}
                    mode={targetValueMode}
                    label={effectAction === 'filter_values' 
                      ? 'Only show these values:' 
                      : 'Set default to:'}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Preview */}
          {previewDescription && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Rule Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">{previewDescription}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Warning */}
          {!isValid && (conditionOptionKey || targetOptionKey) && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Please complete all required fields
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Saving...' : existingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
