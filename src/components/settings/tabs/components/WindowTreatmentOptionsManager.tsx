import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OptionItem extends EnhancedInventoryItem {
  option_type?: string;
  option_value?: string;
}

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
  const { data: optionsData = [], isLoading } = useEnhancedInventoryByCategory('treatment_option');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  
  const options = optionsData as OptionItem[];
  
  const [activeTreatment, setActiveTreatment] = useState<TreatmentCategory>('roller_blind');
  const [activeOptionType, setActiveOptionType] = useState<string>('tube_size');
  const [isCreating, setIsCreating] = useState(false);
  const [editingOption, setEditingOption] = useState<OptionItem | null>(null);
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

  const getFilteredOptions = (treatmentType: TreatmentCategory, optionType: string) => {
    return options.filter(opt => {
      try {
        const details = opt.description ? JSON.parse(opt.description) : {};
        return details.option_type === optionType && opt.treatment_type === treatmentType;
      } catch {
        return false;
      }
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both name and value.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save options.",
          variant: "destructive"
        });
        return;
      }

      const optionDetails = {
        option_type: activeOptionType,
        option_value: formData.value,
      };

      const itemData = {
        user_id: user.id,
        name: formData.name.trim(),
        price_per_meter: formData.price,
        description: JSON.stringify(optionDetails),
        category: 'treatment_option' as const,
        treatment_type: activeTreatment,
        quantity: 1,
        active: true,
        fullness_ratio: 1,
        labor_hours: 0,
      };

      if (editingOption) {
        await updateItem.mutateAsync({ id: editingOption.id, ...itemData });
        setEditingOption(null);
        toast({
          title: "Option updated",
          description: "The option has been updated.",
        });
      } else {
        await createItem.mutateAsync(itemData);
        setIsCreating(false);
        toast({
          title: "Option created",
          description: "New option has been created.",
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving option:', error);
      toast({
        title: "Save failed",
        description: "Failed to save option. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (option: OptionItem) => {
    let optionDetails = {
      option_type: activeOptionType,
      option_value: '',
    };

    try {
      if (option.description) {
        const parsed = JSON.parse(option.description);
        optionDetails = { ...optionDetails, ...parsed };
      }
    } catch (e) {
      console.log('Could not parse option details, using defaults');
    }

    setFormData({
      name: option.name,
      value: optionDetails.option_value,
      price: option.price_per_meter || 0,
    });
    setEditingOption(option);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this option?')) {
      try {
        await deleteItem.mutateAsync(id);
        toast({
          title: "Option deleted",
          description: "The option has been removed.",
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
    setEditingOption(null);
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

  if (isLoading) {
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
          <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
            {currentOptions.map(opt => (
              <TabsTrigger key={opt.type} value={opt.type}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {currentOptions.map((optType) => (
            <TabsContent key={optType.type} value={optType.type} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Add {optType.label.toLowerCase()} for {getTreatmentLabel(activeTreatment).toLowerCase()}
                </p>
                <Button onClick={() => { setActiveOptionType(optType.type); setIsCreating(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              {/* Create/Edit Form */}
              {(isCreating || editingOption) && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingOption ? `Edit Option` : `Add New Option`}
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
                      {editingOption ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2">
                {getFilteredOptions(activeTreatment, optType.type).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {optType.label.toLowerCase()} yet. Click "Add Option" to create one.
                  </div>
                ) : (
                  getFilteredOptions(activeTreatment, optType.type).map((option) => {
                    const details = JSON.parse(option.description || '{}');
                    return (
                      <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Value: {details.option_value}
                            {option.price_per_meter > 0 && ` • +$${option.price_per_meter.toFixed(2)}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(option)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
