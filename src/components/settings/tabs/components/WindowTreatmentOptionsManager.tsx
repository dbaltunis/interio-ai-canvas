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
import { useOptionTypeCategories, useCreateOptionTypeCategory } from "@/hooks/useOptionTypeCategories";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TreatmentCategory = 'roller_blind' | 'roman_blind' | 'venetian_blind' | 'vertical_blind' | 'shutter' | 'awning' | 'plantation_shutter' | 'cellular_shade' | 'curtains' | 'panel_glide';

export const WindowTreatmentOptionsManager = () => {
  const { data: allTreatmentOptions = [], isLoading } = useAllTreatmentOptions();
  
  const [activeTreatment, setActiveTreatment] = useState<TreatmentCategory>('roller_blind');
  const [activeOptionType, setActiveOptionType] = useState<string>('');
  
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
  
  // Fetch option type categories dynamically from database
  const { data: optionTypeCategories = [], isLoading: categoriesLoading } = useOptionTypeCategories(activeTreatment);
  
  const createTreatmentOption = useCreateTreatmentOption();
  const createOptionValue = useCreateOptionValue();
  const updateOptionValue = useUpdateOptionValue();
  const deleteOptionValue = useDeleteOptionValue();
  const createOptionTypeCategory = useCreateOptionTypeCategory();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [showCreateOptionTypeDialog, setShowCreateOptionTypeDialog] = useState(false);
  const [newOptionTypeData, setNewOptionTypeData] = useState({ type_label: '', type_key: '' });
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    price: 0 as number,
  });

  // Set first option type when categories load
  useEffect(() => {
    if (optionTypeCategories.length > 0 && !activeOptionType) {
      setActiveOptionType(optionTypeCategories[0].type_key);
    }
  }, [optionTypeCategories, activeOptionType]);

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
                extra_data: { price: Number(formData.price) || 0 },
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
        
        // Track created options to avoid duplicates
        const createdOptions = new Map<string, any>();
        
        for (const template of userTemplates) {
          // Check if this option type already exists for this template
          let treatmentOption = allTreatmentOptions.find(
            (opt: any) => opt.treatment_id === template.id && opt.key === activeOptionType
          );

          // If not in cache, check if we just created it
          if (!treatmentOption && createdOptions.has(template.id)) {
            treatmentOption = createdOptions.get(template.id);
          }

          // If still not found, create it
          if (!treatmentOption) {
            const optionTypeConfig = optionTypeCategories.find(
              opt => opt.type_key === activeOptionType
            );
            
            try {
              const newOption = await createTreatmentOption.mutateAsync({
                template_id: template.id,
                key: activeOptionType,
                label: optionTypeConfig?.type_label || activeOptionType,
                input_type: 'select',
                required: false,
                visible: true,
                order_index: 0,
                treatment_category: activeTreatment,
                is_system_default: false,
              });
              treatmentOption = newOption;
              createdOptions.set(template.id, newOption);
            } catch (error: any) {
              // If duplicate error, try to fetch the option that was just created
              if (error?.code === '23505') {
                const { data } = await supabase
                  .from('treatment_options')
                  .select('*')
                  .eq('template_id', template.id)
                  .eq('key', activeOptionType)
                  .single();
                if (data) {
                  treatmentOption = data;
                  createdOptions.set(template.id, data);
                } else {
                  throw error;
                }
              } else {
                throw error;
              }
            }
          }

          // Now create the value
          await createOptionValue.mutateAsync({
            option_id: treatmentOption.id,
            code: formData.value.trim().toLowerCase().replace(/\s+/g, '_'),
            label: formData.name.trim(),
            order_index: uniqueOptionValues.length,
            extra_data: { price: Number(formData.price) || 0 },
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
      price: Number(value.extra_data?.price) || 0,
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

  const handleCreateOptionType = async () => {
    if (!newOptionTypeData.type_label.trim() || !newOptionTypeData.type_key.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both type label and type key.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createOptionTypeCategory.mutateAsync({
        treatment_category: activeTreatment,
        type_key: newOptionTypeData.type_key.toLowerCase().replace(/\s+/g, '_'),
        type_label: newOptionTypeData.type_label.trim(),
      });
      
      setShowCreateOptionTypeDialog(false);
      setNewOptionTypeData({ type_label: '', type_key: '' });
      toast({
        title: "Option type created",
        description: "You can now add values to this option type.",
      });
    } catch (error: any) {
      console.error('Error creating option type:', error);
      toast({
        title: "Create failed",
        description: error?.message || "Failed to create option type. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTreatmentLabel = (category: TreatmentCategory) => {
    const labels: Record<TreatmentCategory, string> = {
      roller_blind: 'Roller Blinds',
      roman_blind: 'Roman Blinds',
      venetian_blind: 'Venetian Blinds',
      vertical_blind: 'Vertical Blinds',
      shutter: 'Shutters',
      awning: 'Awnings',
      plantation_shutter: 'Plantation Shutters',
      cellular_shade: 'Cellular Shades',
      curtains: 'Curtains',
      panel_glide: 'Panel Glides',
    };
    return labels[category];
  };

  if (isLoading || templatesLoading || categoriesLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

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
              setActiveOptionType(''); // Will be set by useEffect when categories load
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
              {optionTypeCategories.map(opt => (
                <TabsTrigger key={opt.type_key} value={opt.type_key} className="px-3">
                  {opt.type_label}
                </TabsTrigger>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateOptionTypeDialog(true)}
                className="ml-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                New Type
              </Button>
            </TabsList>
          </ScrollArea>

          {optionTypeCategories.map((optType) => {
            const isSystemOnly = matchingTemplates.length > 0 && matchingTemplates.every(t => t.is_system_default);
            
            return (
              <TabsContent key={optType.type_key} value={optType.type_key} className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {isSystemOnly 
                      ? `Viewing system ${optType.type_label.toLowerCase()} (clone template to customize)`
                      : `Add ${optType.type_label.toLowerCase()} for ${getTreatmentLabel(activeTreatment).toLowerCase()}`
                    }
                  </p>
                  {!isSystemOnly && (
                    <Button onClick={() => handleAddOption(optType.type_key)}>
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
                        placeholder="e.g. 38mm Tube"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Value *</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="e.g. 38mm"
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
                    <p className="font-medium">No {optType.type_label.toLowerCase()} found</p>
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
                          {value.extra_data?.price !== undefined && ` • ${value.extra_data.price === 0 ? 'Included' : `+$${value.extra_data.price.toFixed(2)}`}`}
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

        {/* Create Option Type Dialog */}
        <Dialog open={showCreateOptionTypeDialog} onOpenChange={setShowCreateOptionTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Option Type</DialogTitle>
              <DialogDescription>
                Add a new option type category for {getTreatmentLabel(activeTreatment)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="type_label">Option Type Label *</Label>
                <Input
                  id="type_label"
                  value={newOptionTypeData.type_label}
                  onChange={(e) => setNewOptionTypeData({ ...newOptionTypeData, type_label: e.target.value })}
                  placeholder="e.g. Motor Types"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Display name for this option type
                </p>
              </div>
              
              <div>
                <Label htmlFor="type_key">Option Type Key *</Label>
                <Input
                  id="type_key"
                  value={newOptionTypeData.type_key}
                  onChange={(e) => setNewOptionTypeData({ ...newOptionTypeData, type_key: e.target.value })}
                  placeholder="e.g. motor_type"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Technical key (lowercase with underscores)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateOptionTypeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOptionType}>
                Create Option Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
