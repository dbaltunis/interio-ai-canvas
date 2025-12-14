import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Loader2, RefreshCw, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAllTreatmentOptions } from "@/hooks/useTreatmentOptionsManagement";
import { useTemplateOptionSettings, useToggleTemplateOption } from "@/hooks/useTemplateOptionSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TWCQuestion {
  name: string;
  options: string[];
  isRequired: boolean;
}

interface TemplateOptionsManagerProps {
  treatmentCategory: string;
  templateId?: string;
  linkedTWCProduct?: any; // Pass linked TWC product for option sync
}

export const TemplateOptionsManager = ({ treatmentCategory, templateId, linkedTWCProduct }: TemplateOptionsManagerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Fetch all treatment options and filter by category
  const { data: allOptions = [], isLoading, error, refetch } = useAllTreatmentOptions();
  
  // Fetch template option settings
  const { data: templateSettings = [] } = useTemplateOptionSettings(templateId);
  const toggleOption = useToggleTemplateOption();
  
  // Get TWC questions from linked product
  const twcQuestions: TWCQuestion[] = useMemo(() => {
    if (!linkedTWCProduct?.metadata?.twc_questions) return [];
    return linkedTWCProduct.metadata.twc_questions || [];
  }, [linkedTWCProduct]);
  
  // Filter options for this specific treatment category
  const filteredOptions = allOptions.filter(opt => opt.treatment_category === treatmentCategory);
  
  // PHASE 3: Sort to show TWC options first with badge
  const categoryOptions = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      const aIsTWC = (a as any).source === 'twc';
      const bIsTWC = (b as any).source === 'twc';
      if (aIsTWC && !bIsTWC) return -1;
      if (!aIsTWC && bIsTWC) return 1;
      return 0;
    });
  }, [filteredOptions]);
  
  // Check if any TWC options exist in treatment_options
  const hasTWCOptions = categoryOptions.some(opt => (opt as any).source === 'twc');
  
  // Check if TWC product has options that aren't synced yet
  const hasPendingTWCOptions = twcQuestions.length > 0 && !hasTWCOptions;
  
  console.log('🎯 TemplateOptionsManager:', {
    treatmentCategory,
    templateId,
    linkedTWCProduct: linkedTWCProduct?.name,
    twcQuestionsCount: twcQuestions.length,
    categoryOptionsCount: categoryOptions.length,
    hasTWCOptions,
    hasPendingTWCOptions,
  });
  
  // Sync TWC options to treatment_options table
  const syncTWCOptions = async () => {
    if (!linkedTWCProduct || !templateId || twcQuestions.length === 0) return;
    
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get account owner
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      // Create treatment options for each TWC question
      for (const question of twcQuestions) {
        const optionKey = question.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Check if option already exists
        const { data: existingOption } = await supabase
          .from('treatment_options')
          .select('id')
          .eq('account_id', accountId)
          .eq('treatment_category', treatmentCategory)
          .eq('key', optionKey)
          .single();
        
        let optionId = existingOption?.id;
        
        if (!existingOption) {
          // Create the treatment option
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
          
          // Create option values with required fields
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
        
        // Create template_option_settings linkage if it doesn't exist
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
              });
          }
        }
      }
      
      toast({
        title: 'Options Synced',
        description: `${twcQuestions.length} TWC options imported successfully`,
      });
      
      // Refetch options
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
  
  // Helper to check if option is enabled (default true if no setting exists)
  const isOptionEnabled = (optionId: string) => {
    const setting = templateSettings.find(s => s.treatment_option_id === optionId);
    return setting ? setting.is_enabled : true; // Default to enabled
  };
  
  // Handler for toggling option
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
  
  // Map treatment categories to option management paths
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
        <CardTitle>Available Options</CardTitle>
        <p className="text-sm text-muted-foreground">
          Toggle options on/off to control which appear for this template in quotes
          {!templateId && " (save template to apply changes)"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TWC Options Pending Sync Banner */}
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

        {categoryOptions.length === 0 && !hasPendingTWCOptions ? (
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
        ) : categoryOptions.length > 0 && (
          <>
            {hasTWCOptions && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>TWC Integration Active:</strong> This template uses imported TWC options (marked with blue badge). 
                  TWC options are shown first and will appear in quotes for this product.
                </p>
              </div>
            )}

            <Accordion type="multiple" className="w-full">
              {categoryOptions.map((option) => {
                const visibleValues = option.option_values?.filter(v => !v.hidden_by_user) || [];
                const hiddenValues = option.option_values?.filter(v => v.hidden_by_user) || [];
                const enabled = isOptionEnabled(option.id);
                const isTWCOption = (option as any).source === 'twc';
                
                return (
                  <AccordionItem key={option.id} value={option.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.label}</span>
                          {isTWCOption && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                              TWC
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {visibleValues.length} option{visibleValues.length !== 1 ? 's' : ''}
                          </Badge>
                          {hiddenValues.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {hiddenValues.length} hidden
                            </Badge>
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
                              handleToggle(option.id, enabled);
                            }}
                            disabled={!templateId || toggleOption.isPending}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {visibleValues.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {visibleValues.map((value) => (
                              <Badge key={value.id} variant="outline" className="text-xs">
                                {value.label}
                                {value.extra_data?.price > 0 && (
                                  <span className="ml-1 text-muted-foreground">
                                    ${value.extra_data.price.toFixed(2)}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No visible options configured
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

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
                Use toggles above to enable/disable options for this template. Only enabled options will appear in quotes.
                {!templateId && " Save the template to apply your toggle settings."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
