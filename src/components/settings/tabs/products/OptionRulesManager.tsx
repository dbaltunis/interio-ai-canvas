import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Zap, Eye, EyeOff, AlertCircle, ListFilter, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTreatmentOptionRules, useCreateOptionRule, useUpdateOptionRule, useDeleteOptionRule, OptionRule } from '@/hooks/useOptionRules';
import { useTreatmentOptions } from '@/hooks/useTreatmentOptions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptionRulesGuide } from './OptionRulesGuide';
import { OptionRuleWizard } from './OptionRuleWizard';
import { RuleTemplatesPanel } from './RuleTemplatesPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OptionRulesManagerProps {
  templateId: string;
}

// Helper to get icon for action type
const getActionIcon = (action: string) => {
  switch (action) {
    case 'show_option': return <Eye className="h-4 w-4 text-green-500" />;
    case 'hide_option': return <EyeOff className="h-4 w-4 text-orange-500" />;
    case 'require_option': return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'set_default': return <CheckSquare className="h-4 w-4 text-blue-500" />;
    case 'filter_values': return <ListFilter className="h-4 w-4 text-purple-500" />;
    default: return <Zap className="h-4 w-4" />;
  }
};

// Helper to format action label
const getActionLabel = (action: string) => {
  switch (action) {
    case 'show_option': return 'Show';
    case 'hide_option': return 'Hide';
    case 'require_option': return 'Require';
    case 'set_default': return 'Default';
    case 'filter_values': return 'Filter';
    default: return action;
  }
};

export const OptionRulesManager = ({ templateId }: OptionRulesManagerProps) => {
  console.log('🔧 OptionRulesManager - templateId:', templateId);
  
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<OptionRule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // First, get the template to find its treatment_category
  const { data: template, isLoading: templateLoading, error: templateError } = useQuery({
    queryKey: ['template-for-rules', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('treatment_category, user_id, name')
        .eq('id', templateId)
        .single();
      
      if (error) {
        console.error('❌ Error loading template:', error);
        throw error;
      }
      console.log('✅ Template loaded for rules:', data);
      return data;
    },
    enabled: !!templateId,
  });

  const { data: rules = [], isLoading: rulesLoading, error: rulesError } = useTreatmentOptionRules(templateId);
  
  console.log('📋 Rules state:', { 
    rulesCount: rules.length, 
    rules, 
    rulesLoading, 
    rulesError,
    templateLoading,
    templateError 
  });
  
  // Use treatment_category to query options
  const { data: options = [], isLoading: optionsLoading } = useTreatmentOptions(
    template?.treatment_category, 
    'category'
  );
  
  console.log('🎯 Options for rules:', { 
    optionsCount: options.length, 
    category: template?.treatment_category,
    optionsLoading 
  });
  
  const createRule = useCreateOptionRule();
  const updateRule = useUpdateOptionRule();
  const deleteRule = useDeleteOptionRule();
  
  const { toast } = useToast();

  const handleSaveRule = async (ruleData: Omit<OptionRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingRule) {
        await updateRule.mutateAsync({
          id: editingRule.id,
          updates: ruleData,
        });
        toast({
          title: "Rule Updated",
          description: "The conditional rule has been updated successfully.",
        });
      } else {
        await createRule.mutateAsync(ruleData);
        toast({
          title: "Rule Created",
          description: "The new conditional rule has been created.",
        });
      }
      setEditingRule(null);
    } catch (error) {
      console.error('❌ Error saving rule:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rule. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteRule = async () => {
    if (!deleteConfirmId) return;
    
    try {
      await deleteRule.mutateAsync({ id: deleteConfirmId, templateId });
      toast({
        title: "Rule Deleted",
        description: "The conditional rule has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleEditRule = (rule: OptionRule) => {
    setEditingRule(rule);
    setWizardOpen(true);
  };

  const handleCreateNew = () => {
    setEditingRule(null);
    setWizardOpen(true);
  };

  // Helper to get option label from key
  const getOptionLabel = (key: string) => 
    options.find(opt => opt.key === key)?.label || key;

  return (
    <div className="space-y-6">
      <OptionRulesGuide />
      
      {/* Quick Templates */}
      <RuleTemplatesPanel 
        onSelectTemplate={(template) => {
          // Open wizard with template pattern pre-filled hints
          setEditingRule(null);
          setWizardOpen(true);
          toast({
            title: "Template Selected",
            description: `Use "${template.name}" pattern. Select matching options from your list.`,
          });
        }} 
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Option Rules
              <Badge variant="secondary" className="ml-2">{rules.length}</Badge>
            </CardTitle>
            <CardDescription>
              Configure conditional visibility and behavior for options
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {templateLoading && (
            <div className="text-sm text-muted-foreground">Loading template information...</div>
          )}
          {templateError && (
            <div className="text-sm text-destructive">Error loading template: {templateError.message}</div>
          )}
          {template && options.length === 0 && !optionsLoading && (
            <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
              No options found for treatment category "{template.treatment_category}". 
              Add options in the Treatment Settings tab first.
            </div>
          )}
          {rulesError && (
            <div className="text-sm text-destructive">Error loading rules: {rulesError.message}</div>
          )}
          
          {rules.length === 0 && !rulesLoading && !rulesError && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No conditional rules yet</p>
              <p className="text-xs mt-1">Create rules to show/hide options based on selections</p>
            </div>
          )}
          
          {rules.map(rule => (
            <Card key={rule.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-md bg-muted shrink-0">
                    {getActionIcon(rule.effect.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{rule.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        When: {getOptionLabel(rule.condition.option_key)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rule.condition.operator}: {
                          Array.isArray(rule.condition.value) 
                            ? rule.condition.value.join(', ')
                            : rule.condition.value
                        }
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getActionLabel(rule.effect.action)}: {getOptionLabel(rule.effect.target_option_key)}
                      </Badge>
                      {rule.effect.target_value && (
                        <Badge variant="secondary" className="text-xs bg-primary/10">
                          → {Array.isArray(rule.effect.target_value) 
                            ? `${rule.effect.target_value.length} values`
                            : rule.effect.target_value}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmId(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Rule Wizard Dialog */}
      <OptionRuleWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        templateId={templateId}
        options={options}
        existingRule={editingRule}
        onSave={handleSaveRule}
        isLoading={createRule.isPending || updateRule.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this conditional rule. Options will no longer be affected by this rule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
