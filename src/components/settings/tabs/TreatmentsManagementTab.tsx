import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTreatmentTemplates, useUpdateTreatmentTemplate } from "@/hooks/useTreatmentTemplates";
import { useTreatmentOptions, useUpdateTreatmentOption } from "@/hooks/useTreatmentOptions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export const TreatmentsManagementTab = () => {
  const { data: templates, isLoading: templatesLoading } = useTreatmentTemplates();
  const { toast } = useToast();
  const updateTemplate = useUpdateTreatmentTemplate();

  const handleToggleTemplate = async (id: string, active: boolean) => {
    try {
      await updateTemplate.mutateAsync({ id, updates: { active } });
      toast({
        title: "Treatment updated",
        description: `Treatment ${active ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update treatment",
        variant: "destructive",
      });
    }
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Treatment Templates
          </CardTitle>
          <CardDescription>
            Manage your available window covering treatments and configure their options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {templates?.map((template) => (
              <AccordionItem key={template.id} value={template.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div>
                        <Label htmlFor={`active-${template.id}`} className="font-medium">
                          Enable Template
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make this treatment available for quotes and jobs
                        </p>
                      </div>
                      <Switch
                        id={`active-${template.id}`}
                        checked={template.active}
                        onCheckedChange={(checked) => handleToggleTemplate(template.id, checked)}
                      />
                    </div>


                    <TreatmentOptionsConfig treatmentId={template.id} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

const TreatmentOptionsConfig = ({ treatmentId }: { treatmentId: string }) => {
  const { data: options, isLoading } = useTreatmentOptions(treatmentId);
  const updateOption = useUpdateTreatmentOption();
  const { toast } = useToast();

  const handleToggleOption = async (id: string, field: 'visible' | 'required', value: boolean) => {
    try {
      await updateOption.mutateAsync({ id, updates: { [field]: value } });
      toast({
        title: "Option updated",
        description: "Option configuration saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update option",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No options configured for this treatment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Configure Options</h4>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label className="font-medium">{option.label}</Label>
                <Badge variant="outline" className="text-xs">
                  {option.input_type}
                </Badge>
              </div>
              {option.option_values && option.option_values.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {option.option_values.length} value{option.option_values.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor={`visible-${option.id}`} className="text-sm">Visible</Label>
                <Switch
                  id={`visible-${option.id}`}
                  checked={option.visible}
                  onCheckedChange={(checked) => handleToggleOption(option.id, 'visible', checked)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`required-${option.id}`} className="text-sm">Required</Label>
                <Switch
                  id={`required-${option.id}`}
                  checked={option.required}
                  onCheckedChange={(checked) => handleToggleOption(option.id, 'required', checked)}
                  disabled={!option.visible}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
