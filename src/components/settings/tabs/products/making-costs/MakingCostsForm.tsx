
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useMakingCosts } from "@/hooks/useMakingCosts";
import { useToast } from "@/hooks/use-toast";

interface MakingCostOption {
  name: string;
  pricing_method: string;
  base_price: number;
  fullness?: number;
  sort_order: number;
}

interface MakingCostsFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const MakingCostsForm = ({ initialData, onSave, onCancel }: MakingCostsFormProps) => {
  const { createMakingCost, updateMakingCost } = useMakingCosts();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    pricing_method: initialData?.pricing_method || 'per-linear-meter',
    measurement_type: initialData?.measurement_type || 'fabric-drop-required',
    include_fabric_selection: initialData?.include_fabric_selection || true,
    active: initialData?.active !== undefined ? initialData.active : true,
    heading_options: initialData?.heading_options || [],
    hardware_options: initialData?.hardware_options || [],
    lining_options: initialData?.lining_options || [],
    drop_ranges: initialData?.drop_ranges || []
  });

  const addOption = (type: 'heading' | 'hardware' | 'lining') => {
    const newOption: MakingCostOption = {
      name: '',
      pricing_method: 'fixed',
      base_price: 0,
      fullness: type === 'heading' ? 2 : undefined,
      sort_order: formData[`${type}_options`].length
    };
    
    setFormData(prev => ({
      ...prev,
      [`${type}_options`]: [...prev[`${type}_options`], newOption]
    }));
  };

  const updateOption = (type: 'heading' | 'hardware' | 'lining', index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [`${type}_options`]: prev[`${type}_options`].map((option: any, i: number) =>
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const removeOption = (type: 'heading' | 'hardware' | 'lining', index: number) => {
    setFormData(prev => ({
      ...prev,
      [`${type}_options`]: prev[`${type}_options`].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    try {
      if (initialData?.id) {
        await updateMakingCost.mutateAsync({ id: initialData.id, updates: formData });
      } else {
        await createMakingCost.mutateAsync(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving making cost:', error);
    }
  };

  const renderOptionsSection = (type: 'heading' | 'hardware' | 'lining', title: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title} Options</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => addOption(type)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {formData[`${type}_options`].map((option: any, index: number) => (
          <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded">
            <Input
              placeholder="Option name"
              value={option.name}
              onChange={(e) => updateOption(type, index, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={option.base_price}
              onChange={(e) => updateOption(type, index, 'base_price', parseFloat(e.target.value) || 0)}
            />
            {type === 'heading' && (
              <Input
                type="number"
                placeholder="Fullness"
                value={option.fullness || 2}
                onChange={(e) => updateOption(type, index, 'fullness', parseFloat(e.target.value) || 2)}
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeOption(type, index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Configuration Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Standard Curtain Making"
            required
          />
        </div>
        <div>
          <Label>Pricing Method</Label>
          <Select
            value={formData.pricing_method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
              <SelectItem value="per-panel">Per Panel</SelectItem>
              <SelectItem value="per-drop">Per Drop</SelectItem>
              <SelectItem value="fixed-price">Fixed Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="include_fabric"
            checked={formData.include_fabric_selection}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_fabric_selection: checked }))}
          />
          <Label htmlFor="include_fabric">Include Fabric Selection</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      {/* Options Sections */}
      <div className="space-y-4">
        {renderOptionsSection('heading', 'Heading')}
        {renderOptionsSection('hardware', 'Hardware')}
        {renderOptionsSection('lining', 'Lining')}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Configuration
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
