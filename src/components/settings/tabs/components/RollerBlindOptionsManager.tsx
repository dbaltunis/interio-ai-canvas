import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useEnhancedInventoryByCategory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import type { EnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OptionType = 'tube_size' | 'mount_type' | 'fascia_type' | 'bottom_rail_style' | 'control_type' | 'motor_type';

interface OptionItem extends EnhancedInventoryItem {
  option_type?: string;
  option_value?: string;
}

export const RollerBlindOptionsManager = () => {
  const { data: optionsData = [], isLoading } = useEnhancedInventoryByCategory('blind_option');
  const createItem = useCreateEnhancedInventoryItem();
  const updateItem = useUpdateEnhancedInventoryItem();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  
  const options = optionsData as OptionItem[];
  
  const [activeTab, setActiveTab] = useState<OptionType>('tube_size');
  const [isCreating, setIsCreating] = useState(false);
  const [editingOption, setEditingOption] = useState<OptionItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    price: 0,
    treatment_type: 'roller_blind',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      price: 0,
      treatment_type: 'roller_blind',
    });
  };

  const getFilteredOptions = (type: OptionType) => {
    return options.filter(opt => {
      try {
        const details = opt.description ? JSON.parse(opt.description) : {};
        return details.option_type === type;
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
        option_type: activeTab,
        option_value: formData.value,
      };

      const itemData = {
        user_id: user.id,
        name: formData.name.trim(),
        price_per_meter: formData.price,
        description: JSON.stringify(optionDetails),
        category: 'blind_option' as const,
        treatment_type: formData.treatment_type,
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
      option_type: activeTab,
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
      treatment_type: option.treatment_type || 'roller_blind',
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

  const getTabLabel = (type: OptionType) => {
    const labels: Record<OptionType, string> = {
      tube_size: 'Tube Sizes',
      mount_type: 'Mount Types',
      fascia_type: 'Fascia Types',
      bottom_rail_style: 'Bottom Rails',
      control_type: 'Control Types',
      motor_type: 'Motor Types',
    };
    return labels[type];
  };

  const getPlaceholder = (type: OptionType) => {
    const placeholders: Record<OptionType, { name: string; value: string }> = {
      tube_size: { name: '38mm Tube', value: '38' },
      mount_type: { name: 'Inside Mount', value: 'inside_mount' },
      fascia_type: { name: 'Standard Fascia', value: 'standard_fascia' },
      bottom_rail_style: { name: 'Weighted Bar', value: 'weighted' },
      control_type: { name: 'Chain Control', value: 'chain' },
      motor_type: { name: 'Battery Motor', value: 'battery' },
    };
    return placeholders[type];
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roller Blind Options</CardTitle>
        <CardDescription>
          Manage individual options for roller blinds that can be selected when creating jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OptionType)} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tube_size">Tube Sizes</TabsTrigger>
            <TabsTrigger value="mount_type">Mount Types</TabsTrigger>
            <TabsTrigger value="fascia_type">Fascia Types</TabsTrigger>
            <TabsTrigger value="bottom_rail_style">Bottom Rails</TabsTrigger>
            <TabsTrigger value="control_type">Controls</TabsTrigger>
            <TabsTrigger value="motor_type">Motors</TabsTrigger>
          </TabsList>

          {(['tube_size', 'mount_type', 'fascia_type', 'bottom_rail_style', 'control_type', 'motor_type'] as OptionType[]).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Add {getTabLabel(type).toLowerCase()} that will be available when creating roller blind jobs
                </p>
                <Button onClick={() => { setActiveTab(type); setIsCreating(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {getTabLabel(type).slice(0, -1)}
                </Button>
              </div>

              {/* Create/Edit Form */}
              {(isCreating || editingOption) && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingOption ? `Edit ${getTabLabel(type).slice(0, -1)}` : `Add New ${getTabLabel(type).slice(0, -1)}`}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={getPlaceholder(type).name}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Value *</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder={getPlaceholder(type).value}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {type === 'tube_size' ? 'Numeric value (e.g., 38, 50, 63)' : 'Lowercase with underscores (e.g., inside_mount)'}
                      </p>
                    </div>

                    <div>
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

                    <div>
                      <Label htmlFor="treatment_type">Treatment Type</Label>
                      <Select 
                        value={formData.treatment_type} 
                        onValueChange={(value) => setFormData({ ...formData, treatment_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="roller_blind">Roller Blind</SelectItem>
                          <SelectItem value="roman_blind">Roman Blind</SelectItem>
                          <SelectItem value="venetian_blind">Venetian Blind</SelectItem>
                        </SelectContent>
                      </Select>
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
                {getFilteredOptions(type).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {getTabLabel(type).toLowerCase()} yet. Click "Add {getTabLabel(type).slice(0, -1)}" to create one.
                  </div>
                ) : (
                  getFilteredOptions(type).map((option) => {
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
