import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAllTreatmentOptions } from "@/hooks/useTreatmentOptionsManagement";
import { useTemplateOptionSettings, useToggleTemplateOption } from "@/hooks/useTemplateOptionSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TemplateOptionsManagerProps {
  treatmentCategory: string;
  templateId?: string;
}

export const TemplateOptionsManager = ({ treatmentCategory, templateId }: TemplateOptionsManagerProps) => {
  const navigate = useNavigate();
  
  // Fetch all treatment options and filter by category
  const { data: allOptions = [], isLoading, error } = useAllTreatmentOptions();
  
  // Fetch template option settings
  const { data: templateSettings = [] } = useTemplateOptionSettings(templateId);
  const toggleOption = useToggleTemplateOption();
  
  // Debug logging
  console.log('🎯 TemplateOptionsManager:', {
    treatmentCategory,
    templateId,
    isLoading,
    error: error?.message,
    allOptionsCount: allOptions.length,
    allOptionsCategories: [...new Set(allOptions.map(o => o.treatment_category))],
  });
  
  // Filter options for this specific treatment category
  const categoryOptions = allOptions.filter(opt => opt.treatment_category === treatmentCategory);
  
  console.log('🔍 Filtered categoryOptions:', {
    treatmentCategory,
    categoryOptionsCount: categoryOptions.length,
    categoryOptions: categoryOptions.map(o => ({ key: o.key, label: o.label, category: o.treatment_category })),
  });
  
  // Helper to check if option is enabled (default true if no setting exists)
  const isOptionEnabled = (optionId: string) => {
    const setting = templateSettings.find(s => s.treatment_option_id === optionId);
    return setting ? setting.is_enabled : true; // Default to enabled
  };
  
  // Check if we can show toggles (always show them, even for new templates)
  const canShowToggles = true; // Always show toggles for option configuration
  
  // Handler for toggling option
  const handleToggle = (optionId: string, currentEnabled: boolean) => {
    if (!templateId) {
      // Show warning toast for unsaved templates
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
        {categoryOptions.length === 0 ? (
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
        ) : (
          <>
            <Accordion type="multiple" className="w-full">
              {categoryOptions.map((option) => {
                const visibleValues = option.option_values?.filter(v => !v.hidden_by_user) || [];
                const hiddenValues = option.option_values?.filter(v => v.hidden_by_user) || [];
                const enabled = isOptionEnabled(option.id);
                
                return (
                  <AccordionItem key={option.id} value={option.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.label}</span>
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
                            console.log('Switch onCheckedChange called for option:', option.id, 'current:', enabled);
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
