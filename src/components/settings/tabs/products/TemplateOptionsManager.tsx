import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Loader2, RefreshCw, Package, GripVertical, Eye, EyeOff, CheckCircle2, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAllTreatmentOptions } from "@/hooks/useTreatmentOptionsManagement";
import { 
  useTemplateOptionSettings, 
  useToggleTemplateOption, 
  useUpdateTemplateOptionOrder,
  useToggleValueVisibility,
  useBulkToggleValueVisibility
} from "@/hooks/useTemplateOptionSettings";
import { useTreatmentOptionRules } from "@/hooks/useOptionRules";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TWCQuestion {
  name: string;
  options: string[];
  isRequired: boolean;
}

interface TemplateOptionsManagerProps {
  treatmentCategory: string;
  templateId?: string;
  linkedTWCProduct?: any;
}

interface SortableOptionItemProps {
  option: any;
  enabled: boolean;
  isTWCOption: boolean;
  templateId?: string;
  hiddenValueIds: string[];
  ruleInfo?: { action: string; description: string }[];
  onToggle: (optionId: string, currentEnabled: boolean) => void;
  onToggleValue: (optionId: string, valueId: string, hide: boolean) => void;
  onBulkToggle: (optionId: string, valueIds: string[], hide: boolean) => void;
  isToggling: boolean;
}

const SortableOptionItem = ({ 
  option, 
  enabled, 
  isTWCOption, 
  templateId, 
  hiddenValueIds,
  ruleInfo,
  onToggle,
  onToggleValue,
  onBulkToggle,
  isToggling 
}: SortableOptionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const allValues = option.option_values?.filter((v: any) => !v.hidden_by_user) || [];
  const visibleValues = allValues.filter((v: any) => !hiddenValueIds.includes(v.id));
  const hiddenCount = hiddenValueIds.filter(id => allValues.some((v: any) => v.id === id)).length;

  const handleValueClick = (valueId: string) => {
    if (!templateId) return;
    const isHidden = hiddenValueIds.includes(valueId);
    onToggleValue(option.id, valueId, !isHidden);
  };

  const handleShowAll = () => {
    if (!templateId) return;
    const allValueIds = allValues.map((v: any) => v.id);
    onBulkToggle(option.id, allValueIds, false);
  };

  const handleHideAll = () => {
    if (!templateId) return;
    const allValueIds = allValues.map((v: any) => v.id);
    onBulkToggle(option.id, allValueIds, true);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={option.id} className="border rounded-lg mb-2 bg-background">
        <AccordionTrigger className="hover:no-underline px-3">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">{option.label}</span>
              {isTWCOption && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                  TWC
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {visibleValues.length} visible
              </Badge>
              {hiddenCount > 0 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {hiddenCount} hidden
                </Badge>
              )}
              {ruleInfo && ruleInfo.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] cursor-help">
                        <Link2 className="h-3 w-3 mr-1" />
                        {ruleInfo[0].action === 'show_option' ? 'Shows when...' : 
                         ruleInfo[0].action === 'hide_option' ? 'Hides when...' : 
                         'Rule-controlled'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {ruleInfo.map((r, i) => (
                        <p key={i} className="text-xs">{r.description}</p>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!enabled && (
                <Badge variant="destructive" className="text-xs">
                  Disabled
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Label htmlFor={`toggle-${option.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id={`toggle-${option.id}`}
                checked={enabled}
                onCheckedChange={() => {
                  onToggle(option.id, enabled);
                }}
                disabled={!templateId || isToggling}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pl-10 pr-4 pb-3">
            {allValues.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Click values to show/hide for this template:</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs px-2"
                    onClick={handleShowAll}
                    disabled={!templateId}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Show All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs px-2"
                    onClick={handleHideAll}
                    disabled={!templateId}
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allValues.map((value: any) => {
                    const isHidden = hiddenValueIds.includes(value.id);
                    return (
                      <Badge 
                        key={value.id} 
                        variant={isHidden ? "outline" : "secondary"}
                        className={`text-xs cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                          isHidden ? 'opacity-50 line-through' : ''
                        } ${!templateId ? 'cursor-not-allowed' : ''}`}
                        onClick={() => handleValueClick(value.id)}
                      >
                        {isHidden ? (
                          <EyeOff className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {value.label}
                        {value.extra_data?.price > 0 && (
                          <span className="ml-1 text-muted-foreground">
                            ${value.extra_data.price.toFixed(2)}
                          </span>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No options configured
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export const TemplateOptionsManager = ({ treatmentCategory, templateId, linkedTWCProduct }: TemplateOptionsManagerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnablingAll, setIsEnablingAll] = useState(false);
  const [localOrderedOptions, setLocalOrderedOptions] = useState<any[]>([]);
  
  const { data: allOptions = [], isLoading, error, refetch } = useAllTreatmentOptions();
  const { data: templateSettings = [] } = useTemplateOptionSettings(templateId);
  const { data: rules = [] } = useTreatmentOptionRules(templateId);
  const toggleOption = useToggleTemplateOption();
  const updateOrder = useUpdateTemplateOptionOrder();
  const toggleValueVisibility = useToggleValueVisibility();
  const bulkToggleVisibility = useBulkToggleValueVisibility();
  
  // Build a map of option key -> rules that affect it
  const optionRuleMap = useMemo(() => {
    const map: Record<string, { action: string; description: string }[]> = {};
    rules.forEach(rule => {
      const key = rule.effect.target_option_key;
      if (!map[key]) map[key] = [];
      map[key].push({ 
        action: rule.effect.action, 
        description: rule.description 
      });
    });
    return map;
  }, [rules]);
  
  // Count rule-controlled options
  const ruleControlledCount = useMemo(() => Object.keys(optionRuleMap).length, [optionRuleMap]);
  
  // Get hidden value IDs for a specific option
  const getHiddenValueIds = (optionId: string): string[] => {
    const setting = templateSettings.find(s => s.treatment_option_id === optionId);
    return (setting?.hidden_value_ids as string[]) || [];
  };
  
  // Handle single value visibility toggle
  const handleToggleValue = (optionId: string, valueId: string, hide: boolean) => {
    if (!templateId) return;
    toggleValueVisibility.mutate({
      templateId,
      treatmentOptionId: optionId,
      valueId,
      hide,
    });
  };
  
  // Handle bulk value visibility toggle
  const handleBulkToggle = (optionId: string, valueIds: string[], hide: boolean) => {
    if (!templateId) return;
    bulkToggleVisibility.mutate({
      templateId,
      treatmentOptionId: optionId,
      valueIds,
      hide,
    });
  };
  
  // Enable all available options for this template
  const handleEnableAllOptions = async () => {
    if (!templateId) return;
    
    setIsEnablingAll(true);
    try {
      // Call the database function to bulk-enable options
      const { data, error } = await supabase.rpc('bulk_enable_template_options', {
        p_template_id: templateId
      });
      
      if (error) throw error;
      
      toast({
        title: 'Options Enabled',
        description: `${data || 'All'} options enabled for this template`,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error enabling all options:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to enable options',
        variant: 'destructive',
      });
    } finally {
      setIsEnablingAll(false);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const twcQuestions: TWCQuestion[] = useMemo(() => {
    if (!linkedTWCProduct?.metadata?.twc_questions) return [];
    return linkedTWCProduct.metadata.twc_questions || [];
  }, [linkedTWCProduct]);
  
  // Filter options: for TWC options, only show if linked to THIS template via template_option_settings
  // For system options, show all that match the treatment_category
  const filteredOptions = useMemo(() => {
    const linkedOptionIds = new Set(templateSettings.map(s => s.treatment_option_id));
    const templateIdPrefix = templateId?.substring(0, 8) || '';
    
    return allOptions.filter(opt => {
      // Must match treatment category
      if (opt.treatment_category !== treatmentCategory) return false;
      
      // For TWC options: only show if explicitly linked OR key matches this template's ID
      if ((opt as any).source === 'twc') {
        const isLinked = linkedOptionIds.has(opt.id);
        const keyMatchesTemplate = templateIdPrefix && opt.key?.endsWith(`_${templateIdPrefix}`);
        return isLinked || keyMatchesTemplate;
      }
      
      // System/custom options: show all matching category
      return true;
    });
  }, [allOptions, treatmentCategory, templateSettings, templateId]);
  
  // Sort options by template-specific order_index, then by TWC status
  const categoryOptions = useMemo(() => {
    const sorted = [...filteredOptions].sort((a, b) => {
      // Get template-specific order
      const aOrder = templateSettings.find(s => s.treatment_option_id === a.id)?.order_index;
      const bOrder = templateSettings.find(s => s.treatment_option_id === b.id)?.order_index;
      
      // If both have order_index, sort by that
      if (aOrder !== null && aOrder !== undefined && bOrder !== null && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      // If only one has order_index, that one comes first
      if (aOrder !== null && aOrder !== undefined) return -1;
      if (bOrder !== null && bOrder !== undefined) return 1;
      
      // Otherwise, sort TWC first
      const aIsTWC = (a as any).source === 'twc';
      const bIsTWC = (b as any).source === 'twc';
      if (aIsTWC && !bIsTWC) return -1;
      if (!aIsTWC && bIsTWC) return 1;
      return 0;
    });
    return sorted;
  }, [filteredOptions, templateSettings]);
  
  // Keep local state in sync with computed order
  useEffect(() => {
    setLocalOrderedOptions(categoryOptions);
  }, [categoryOptions]);
  
  const hasTWCOptions = categoryOptions.some(opt => (opt as any).source === 'twc');
  const hasPendingTWCOptions = twcQuestions.length > 0 && !hasTWCOptions;
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = localOrderedOptions.findIndex(opt => opt.id === active.id);
    const newIndex = localOrderedOptions.findIndex(opt => opt.id === over.id);
    
    const newOrder = arrayMove(localOrderedOptions, oldIndex, newIndex);
    setLocalOrderedOptions(newOrder);
    
    // Save to database
    if (templateId) {
      const orderedOptions = newOrder.map((opt, index) => ({
        treatmentOptionId: opt.id,
        orderIndex: index,
      }));
      updateOrder.mutate({ templateId, orderedOptions });
    }
  };
  
  const syncTWCOptions = async () => {
    if (!linkedTWCProduct || !templateId || twcQuestions.length === 0) return;
    
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      for (const question of twcQuestions) {
        // Create product-specific key using template ID suffix to isolate options per product
        const baseKey = question.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const templateShortId = templateId.substring(0, 8);
        const optionKey = `${baseKey}_${templateShortId}`;
        
        const { data: existingOption } = await supabase
          .from('treatment_options')
          .select('id')
          .eq('account_id', accountId)
          .eq('treatment_category', treatmentCategory)
          .eq('key', optionKey)
          .single();
        
        let optionId = existingOption?.id;
        
        if (!existingOption) {
          const { data: newOption, error: optionError } = await supabase
            .from('treatment_options')
            .insert({
              account_id: accountId,
              treatment_category: treatmentCategory,
              key: optionKey,
              label: question.name,
              input_type: 'select',
              required: question.isRequired,
              source: 'twc',
              order_index: twcQuestions.indexOf(question),
            })
            .select('id')
            .single();
          
          if (optionError) {
            console.error('Error creating option:', optionError);
            continue;
          }
          
          optionId = newOption.id;
          
          const optionValues = question.options.map((opt, index) => ({
            account_id: accountId,
            option_id: optionId!,
            code: opt.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 50),
            label: opt,
            order_index: index,
          }));
          
          if (optionValues.length > 0) {
            await supabase.from('option_values').insert(optionValues);
          }
        }
        
        if (optionId) {
          const { data: existingSetting } = await supabase
            .from('template_option_settings')
            .select('id')
            .eq('template_id', templateId)
            .eq('treatment_option_id', optionId)
            .single();
          
          if (!existingSetting) {
            await supabase
              .from('template_option_settings')
              .insert({
                template_id: templateId,
                treatment_option_id: optionId,
                is_enabled: true,
                order_index: twcQuestions.indexOf(question),
              });
          }
        }
      }
      
      toast({
        title: 'Options Synced',
        description: `${twcQuestions.length} TWC options imported successfully`,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error syncing TWC options:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync TWC options',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const isOptionEnabled = (optionId: string) => {
    const setting = templateSettings.find(s => s.treatment_option_id === optionId);
    return setting ? setting.is_enabled : true;
  };
  
  const handleToggle = (optionId: string, currentEnabled: boolean) => {
    if (!templateId) {
      console.warn('Template not saved yet - toggle will take effect after saving');
      return;
    }
    
    toggleOption.mutate({
      templateId,
      treatmentOptionId: optionId,
      isEnabled: !currentEnabled,
    });
  };
  
  const getOptionsPath = () => {
    switch (treatmentCategory) {
      case 'roller_blinds':
      case 'roman_blinds':
      case 'cellular_blinds':
      case 'venetian_blinds':
      case 'vertical_blinds':
        return '/settings?tab=system&subtab=options';
      case 'curtains':
        return '/settings?tab=system&subtab=headings';
      default:
        return '/settings?tab=system&subtab=options';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Available Options</CardTitle>
            {localOrderedOptions.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {templateSettings.filter(s => s.is_enabled).length} enabled
                </Badge>
                {ruleControlledCount > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    {ruleControlledCount} rule-controlled
                  </Badge>
                )}
              </div>
            )}
          </div>
          {templateId && localOrderedOptions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableAllOptions}
              disabled={isEnablingAll}
            >
              {isEnablingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enable All Options
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Drag to reorder • Toggle options on/off for this template
          {!templateId && " (save template to apply changes)"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPendingTWCOptions && templateId && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {twcQuestions.length} TWC options ready to import
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  This template is linked to a TWC product with {twcQuestions.length} options. 
                  Click sync to import them as selectable options.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={syncTWCOptions}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync TWC Options
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {localOrderedOptions.length === 0 && !hasPendingTWCOptions ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No options configured yet for this treatment type
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(getOptionsPath())}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add Options in System Settings
            </Button>
          </div>
        ) : localOrderedOptions.length > 0 && (
          <>
            {hasTWCOptions && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>TWC Integration Active:</strong> TWC options marked with blue badge. 
                  Drag to reorder options for this specific template.
                </p>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localOrderedOptions.map(o => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion type="multiple" className="w-full space-y-0">
                {localOrderedOptions.map((option) => {
                    const enabled = isOptionEnabled(option.id);
                    const isTWCOption = (option as any).source === 'twc';
                    const hiddenValueIds = getHiddenValueIds(option.id);
                    const ruleInfo = optionRuleMap[option.key];
                    
                    return (
                      <SortableOptionItem
                        key={option.id}
                        option={option}
                        enabled={enabled}
                        isTWCOption={isTWCOption}
                        templateId={templateId}
                        hiddenValueIds={hiddenValueIds}
                        ruleInfo={ruleInfo}
                        onToggle={handleToggle}
                        onToggleValue={handleToggleValue}
                        onBulkToggle={handleBulkToggle}
                        isToggling={toggleOption.isPending}
                      />
                    );
                  })}
                </Accordion>
              </SortableContext>
            </DndContext>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(getOptionsPath())}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Options in System Settings
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Each template can have different option order and selection.
                {!templateId && " Save the template to apply your settings."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
