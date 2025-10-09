import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllTreatmentOptions, useCreateOptionValue, useUpdateOptionValue, useDeleteOptionValue, useCreateTreatmentOption } from "@/hooks/useTreatmentOptionsManagement";
import type { TreatmentOption, OptionValue } from "@/hooks/useTreatmentOptions";
import { useQuery } from "@tanstack/react-query";

type TreatmentCategory = 'roller_blind' | 'roman_blind' | 'venetian_blind' | 'vertical_blind' | 'shutter' | 'awning';

const OPTION_TYPES_BY_CATEGORY: Record<TreatmentCategory, { type: string; label: string; examples: { name: string; value: string } }[]> = {
  roller_blind: [
    { type: 'tube_size', label: 'Tube Sizes', examples: { name: '38mm Tube', value: '38' } },
    { type: 'mount_type', label: 'Mount Types', examples: { name: 'Inside Mount', value: 'inside_mount' } },
    { type: 'fascia_type', label: 'Fascia Types', examples: { name: 'Standard Fascia', value: 'standard_fascia' } },
    { type: 'bottom_rail_style', label: 'Bottom Rails', examples: { name: 'Weighted Bar', value: 'weighted' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Chain Control', value: 'chain' } },
    { type: 'motor_type', label: 'Motor Types', examples: { name: 'Battery Motor', value: 'battery' } },
  ],
  roman_blind: [
    { type: 'headrail_type', label: 'Headrail Types', examples: { name: 'Standard Headrail', value: 'standard' } },
    { type: 'fold_style', label: 'Fold Styles', examples: { name: 'Flat Fold', value: 'flat' } },
    { type: 'lining_type', label: 'Lining Types', examples: { name: 'Blackout Lining', value: 'blackout' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Chain Control', value: 'chain' } },
    { type: 'mount_type', label: 'Mount Types', examples: { name: 'Inside Mount', value: 'inside_mount' } },
  ],
  venetian_blind: [
    { type: 'slat_size', label: 'Slat Sizes', examples: { name: '25mm Slat', value: '25' } },
    { type: 'material', label: 'Materials', examples: { name: 'Aluminum', value: 'aluminum' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Wand Control', value: 'wand' } },
    { type: 'headrail_type', label: 'Headrail Types', examples: { name: 'Standard Headrail', value: 'standard' } },
    { type: 'mount_type', label: 'Mount Types', examples: { name: 'Inside Mount', value: 'inside_mount' } },
  ],
  vertical_blind: [
    { type: 'louvre_width', label: 'Louvre Widths', examples: { name: '89mm Louvre', value: '89' } },
    { type: 'headrail_type', label: 'Headrail Types', examples: { name: 'Standard Track', value: 'standard' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Wand Control', value: 'wand' } },
    { type: 'weight_style', label: 'Weight Styles', examples: { name: 'Chain Weight', value: 'chain' } },
  ],
  shutter: [
    { type: 'louvre_size', label: 'Louvre Sizes', examples: { name: '63mm Louvre', value: '63' } },
    { type: 'frame_type', label: 'Frame Types', examples: { name: 'L-Frame', value: 'l_frame' } },
    { type: 'hinge_type', label: 'Hinge Types', examples: { name: 'Standard Hinge', value: 'standard' } },
    { type: 'material', label: 'Materials', examples: { name: 'Basswood', value: 'basswood' } },
    { type: 'finish_type', label: 'Finish Types', examples: { name: 'Painted', value: 'painted' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Center Tilt Rod', value: 'center_tilt' } },
  ],
  awning: [
    { type: 'motor_type', label: 'Motor Types', examples: { name: 'Somfy RTS', value: 'somfy_rts' } },
    { type: 'bracket_type', label: 'Bracket Types', examples: { name: 'Wall Bracket', value: 'wall' } },
    { type: 'projection_type', label: 'Projection Types', examples: { name: 'Standard Projection', value: 'standard' } },
    { type: 'control_type', label: 'Control Types', examples: { name: 'Remote Control', value: 'remote' } },
    { type: 'arm_type', label: 'Arm Types', examples: { name: 'Folding Arm', value: 'folding' } },
  ],
};

export const WindowTreatmentOptionsManager = () => {
  const { data: allTreatmentOptions = [], isLoading } = useAllTreatmentOptions();
  
  // Fetch curtain templates (including system defaults for viewing)
  const { data: allTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['curtain-templates-for-options'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('*')
        .eq('active', true)
        .or(`user_id.eq.${user.user.id},is_system_default.eq.true`);
      if (error) throw error;
      return data;
    },
  });
  
  const createTreatmentOption = useCreateTreatmentOption();
  const createOptionValue = useCreateOptionValue();
  const updateOptionValue = useUpdateOptionValue();
  const deleteOptionValue = useDeleteOptionValue();
  const { toast } = useToast();
  
  const [activeTreatment, setActiveTreatment] = useState<TreatmentCategory>('venetian_blind');
  const [activeOptionType, setActiveOptionType] = useState<string>('slat_size');
  const [isCreating, setIsCreating] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    price: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      price: 0,
    });
  };

  // Get templates matching the active treatment category (handle both singular and plural forms)
  const matchingTemplates = allTemplates.filter((t: any) => {
    const categoryMap: Record<string, string[]> = {
      'roller_blind': ['roller_blind', 'roller_blinds'],
      'roman_blind': ['roman_blind', 'roman_blinds'],
      'venetian_blind': ['venetian_blind', 'venetian_blinds'],
      'vertical_blind': ['vertical_blind', 'vertical_blinds'],
      'shutter': ['shutter', 'shutters'],
      'awning': ['awning', 'awnings'],
    };
    
    const validCategories = categoryMap[activeTreatment] || [activeTreatment];
    return validCategories.includes(t.curtain_type) || validCategories.includes(t.treatment_category);
  });

  // Find treatment options linked to any of the matching templates
  const relevantOptions = allTreatmentOptions.filter((opt: any) => 
    matchingTemplates.some((t: any) => t.id === opt.treatment_id) && opt.key === activeOptionType
  );

  // For display, we'll show all unique option values across all templates
  const allOptionValues = relevantOptions.flatMap(opt => opt.option_values || []);
  
  // Deduplicate by code
  const uniqueOptionValues = allOptionValues.reduce((acc, val) => {
    if (!acc.find(v => v.code === val.code)) {
      acc.push(val);
    }
    return acc;
  }, [] as OptionValue[]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both name and value.",
        variant: "destructive"
      });
      return;
    }

    if (matchingTemplates.length === 0) {
      toast({
        title: "No templates found",
        description: `Clone a ${getTreatmentLabel(activeTreatment)} template from "Template Library" first.`,
        variant: "destructive"
      });
      return;
    }

    const userTemplates = matchingTemplates.filter(t => !t.is_system_default);
    if (userTemplates.length === 0) {
      toast({
        title: "Clone template first",
        description: `Clone a ${getTreatmentLabel(activeTreatment)} template to customize options.`,
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingValue) {
        // Update the existing option value across all templates
        for (const opt of relevantOptions) {
          const existingVal = opt.option_values?.find(v => v.code === editingValue.code);
          if (existingVal) {
            await updateOptionValue.mutateAsync({
              id: existingVal.id,
              updates: {
                code: formData.value.trim().toLowerCase().replace(/\s+/g, '_'),
                label: formData.name.trim(),
                extra_data: formData.price > 0 ? { price: formData.price } : null,
              }
            });
          }
        }
        setEditingValue(null);
        toast({
          title: "Option updated",
          description: "The option has been updated across all templates.",
        });
      } else {
        // Create option for user's templates only (not system templates)
        const userTemplates = matchingTemplates.filter(t => !t.is_system_default);
        for (const template of userTemplates) {
          // Check if this option type already exists for this template
          let treatmentOption = allTreatmentOptions.find(
            (opt: any) => opt.treatment_id === template.id && opt.key === activeOptionType
          );

          // If not, create it
          if (!treatmentOption) {
            const optionTypeConfig = OPTION_TYPES_BY_CATEGORY[activeTreatment].find(
              opt => opt.type === activeOptionType
            );
            
            const newOption = await createTreatmentOption.mutateAsync({
              treatment_id: template.id,
              key: activeOptionType,
              label: optionTypeConfig?.label || activeOptionType,
              input_type: 'select',
              required: false,
              visible: true,
              order_index: 0,
            });
            treatmentOption = newOption;
          }

          // Now create the value
          await createOptionValue.mutateAsync({
            option_id: treatmentOption.id,
            code: formData.value.trim().toLowerCase().replace(/\s+/g, '_'),
            label: formData.name.trim(),
            order_index: uniqueOptionValues.length,
            extra_data: formData.price > 0 ? { price: formData.price } : null,
          });
        }

        setIsCreating(false);
        toast({
          title: "Option created",
          description: `New option has been added to all ${getTreatmentLabel(activeTreatment)} templates.`,
        });
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save option. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (value: OptionValue) => {
    setFormData({
      name: value.label,
      value: value.code,
      price: value.extra_data?.price || 0,
    });
    setEditingValue(value);
    setIsCreating(false);
  };

  const handleDelete = async (valueCode: string) => {
    if (confirm('Are you sure you want to delete this option from all templates?')) {
      try {
        // Delete this value from all templates
        for (const opt of relevantOptions) {
          const existingVal = opt.option_values?.find(v => v.code === valueCode);
          if (existingVal) {
            await deleteOptionValue.mutateAsync(existingVal.id);
          }
        }
        toast({
          title: "Option deleted",
          description: "The option has been removed from all templates.",
        });
      } catch (error) {
        console.error('Error deleting option:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete option. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingValue(null);
    resetForm();
  };
  
  const handleAddOption = (optionType: string) => {
    setActiveOptionType(optionType);
    setIsCreating(true);
    setEditingValue(null);
    resetForm();
  };

  const getTreatmentLabel = (category: TreatmentCategory) => {
    const labels: Record<TreatmentCategory, string> = {
      roller_blind: 'Roller Blinds',
      roman_blind: 'Roman Blinds',
      venetian_blind: 'Venetian Blinds',
      vertical_blind: 'Vertical Blinds',
      shutter: 'Shutters',
      awning: 'Awnings',
    };
    return labels[category];
  };

  if (isLoading || templatesLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

  const currentOptions = OPTION_TYPES_BY_CATEGORY[activeTreatment];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Window Treatment Options</CardTitle>
        <CardDescription>
          Manage configuration options for all window treatment types (blinds, shutters, awnings)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Treatment Type Selection */}
        <div className="mb-6">
          <Label>Treatment Type</Label>
          <Select 
            value={activeTreatment} 
            onValueChange={(v) => {
              setActiveTreatment(v as TreatmentCategory);
              setActiveOptionType(OPTION_TYPES_BY_CATEGORY[v as TreatmentCategory][0].type);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roller_blind">Roller Blinds</SelectItem>
              <SelectItem value="roman_blind">Roman Blinds</SelectItem>
              <SelectItem value="venetian_blind">Venetian Blinds</SelectItem>
              <SelectItem value="vertical_blind">Vertical Blinds</SelectItem>
              <SelectItem value="shutter">Shutters</SelectItem>
              <SelectItem value="awning">Awnings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeOptionType} onValueChange={(v) => setActiveOptionType(v)} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-none bg-transparent p-1 text-muted-foreground w-max">
              {currentOptions.map(opt => (
                <TabsTrigger key={opt.type} value={opt.type} className="px-3">
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {currentOptions.map((optType) => {
            const isSystemOnly = matchingTemplates.length > 0 && matchingTemplates.every(t => t.is_system_default);
            
            return (
              <TabsContent key={optType.type} value={optType.type} className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {isSystemOnly 
                      ? `Viewing system ${optType.label.toLowerCase()} (clone template to customize)`
                      : `Add ${optType.label.toLowerCase()} for ${getTreatmentLabel(activeTreatment).toLowerCase()}`
                    }
                  </p>
                  {!isSystemOnly && (
                    <Button onClick={() => handleAddOption(optType.type)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

              {/* Create/Edit Form */}
              {(isCreating || editingValue) && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingValue ? `Edit Option` : `Add New Option`}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={optType.examples.name}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Value *</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder={optType.examples.value}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lowercase with underscores for multi-word values
                      </p>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="price">Additional Price (Optional)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave}>
                      {editingValue ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2">
                {matchingTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="font-medium">No {getTreatmentLabel(activeTreatment)} templates available</p>
                    <p className="text-xs mt-1">Clone a system template from "Template Library" tab first</p>
                  </div>
                ) : uniqueOptionValues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="font-medium">No {optType.label.toLowerCase()} found</p>
                    <p className="text-xs mt-1">
                      {matchingTemplates.some(t => t.is_system_default) 
                        ? 'Clone the template to customize options' 
                        : 'Click "Add Option" to create one'}
                    </p>
                  </div>
                ) : (
                  uniqueOptionValues.map((value) => (
                    <div key={value.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium uppercase">{value.label}</div>
                        <div className="text-sm text-muted-foreground">
                          Value: {value.code}
                          {value.extra_data?.price > 0 && ` • +$${value.extra_data.price.toFixed(2)}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(value.code)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          );
        })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
