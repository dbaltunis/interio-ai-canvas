import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTreatmentOptionRules, useCreateOptionRule, useUpdateOptionRule, useDeleteOptionRule, OptionRule } from '@/hooks/useOptionRules';
import { useTreatmentOptions } from '@/hooks/useTreatmentOptions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptionRulesManagerProps {
  templateId: string;
}

export const OptionRulesManager = ({ templateId }: OptionRulesManagerProps) => {
  // First, get the template to find its treatment_category
  const { data: template } = useQuery({
    queryKey: ['template-for-rules', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('treatment_category, curtain_type')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });

  const { data: rules = [] } = useTreatmentOptionRules(templateId);
  // Use treatment_category to query options instead of template_id
  const { data: options = [] } = useTreatmentOptions(
    template?.treatment_category || template?.curtain_type, 
    'category'
  );
  const createRule = useCreateOptionRule();
  const updateRule = useUpdateOptionRule();
  const deleteRule = useDeleteOptionRule();
  
  const { toast } = useToast();
  
  const [editingRule, setEditingRule] = useState<Partial<OptionRule> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'in_list', label: 'In List' },
  ];

  const actions = [
    { value: 'show_option', label: 'Show Option' },
    { value: 'hide_option', label: 'Hide Option' },
    { value: 'require_option', label: 'Require Option' },
    { value: 'set_default', label: 'Set Default Value' },
  ];

  const handleCreateRule = () => {
    setIsCreating(true);
    setEditingRule({
      template_id: templateId,
      condition: {
        option_key: '',
        operator: 'equals',
        value: '',
      },
      effect: {
        action: 'show_option',
        target_option_key: '',
      },
    });
  };

  const handleSaveRule = async () => {
    // Validate required fields
    if (!editingRule?.condition?.option_key) {
      toast({
        title: "Validation Error",
        description: "Please select a condition option (When this option)",
        variant: "destructive",
      });
      return;
    }

    if (!editingRule?.condition?.value) {
      toast({
        title: "Validation Error",
        description: "Please enter or select a condition value",
        variant: "destructive",
      });
      return;
    }

    if (!editingRule?.effect?.target_option_key) {
      toast({
        title: "Validation Error",
        description: "Please select a target option",
        variant: "destructive",
      });
      return;
    }

    const description = `When "${editingRule.condition.option_key}" ${editingRule.condition.operator} "${editingRule.condition.value}", ${editingRule.effect.action.replace('_', ' ')} "${editingRule.effect.target_option_key}"`;

    try {
      if (isCreating) {
        await createRule.mutateAsync({
          ...editingRule as Omit<OptionRule, 'id' | 'created_at' | 'updated_at'>,
          description,
        });
      } else if (editingRule.id) {
        await updateRule.mutateAsync({
          id: editingRule.id,
          updates: { ...editingRule, description },
        });
      }

      toast({
        title: "Success",
        description: "Rule saved successfully",
      });

      setEditingRule(null);
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    await deleteRule.mutateAsync({ id: ruleId, templateId: templateId });
  };

  const getOptionValues = (optionKey: string) => {
    const option = options.find(opt => opt.key === optionKey);
    return option?.option_values || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Option Rules</CardTitle>
        <CardDescription>
          Configure conditional visibility and behavior for options based on other selections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!template && (
          <div className="text-sm text-muted-foreground">Loading template information...</div>
        )}
        {template && options.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No options found for this treatment category. Add options in the Treatment Options tab first.
          </div>
        )}
        {rules.map(rule => (
          <Card key={rule.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{rule.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Condition: {rule.condition.option_key} {rule.condition.operator} {JSON.stringify(rule.condition.value)}
                <br />
                Effect: {rule.effect.action} → {rule.effect.target_option_key}
              </div>
            </div>
          </Card>
        ))}

        {editingRule && (
          <Card className="p-4 border-primary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>When this option</Label>
                  <Select
                    value={editingRule.condition?.option_key || ''}
                    onValueChange={(value) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        condition: { ...prev!.condition!, option_key: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
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
                    value={editingRule.condition?.operator || 'equals'}
                    onValueChange={(value: any) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        condition: { ...prev!.condition!, operator: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                {editingRule.condition?.option_key && getOptionValues(editingRule.condition.option_key).length > 0 ? (
                  <Select
                    value={editingRule.condition?.value as string || ''}
                    onValueChange={(value) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        condition: { ...prev!.condition!, value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionValues(editingRule.condition.option_key).map(val => (
                        <SelectItem key={val.id} value={val.code}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editingRule.condition?.value as string || ''}
                    onChange={(e) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        condition: { ...prev!.condition!, value: e.target.value },
                      }))
                    }
                    placeholder="Enter value"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Then</Label>
                  <Select
                    value={editingRule.effect?.action || 'show_option'}
                    onValueChange={(value: any) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        effect: { ...prev!.effect!, action: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Option</Label>
                  <Select
                    value={editingRule.effect?.target_option_key || ''}
                    onValueChange={(value) =>
                      setEditingRule(prev => ({
                        ...prev!,
                        effect: { ...prev!.effect!, target_option_key: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {options
                        .filter(opt => opt.key !== editingRule.condition?.option_key)
                        .map(opt => (
                          <SelectItem key={opt.id} value={opt.key}>
                            {opt.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingRule(null);
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveRule}>
                  Save Rule
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!editingRule && (
          <Button onClick={handleCreateRule} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Conditional Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
