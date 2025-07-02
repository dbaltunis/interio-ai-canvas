
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CategoryFormProps {
  onSave: (categoryData: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  initialData?: any;
}

export const CategoryForm = ({ onSave, onCancel, isEditing, initialData }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    calculation_method: initialData?.calculation_method || 'fixed',
    affects_fabric_calculation: initialData?.affects_fabric_calculation || false,
    affects_labor_calculation: initialData?.affects_labor_calculation || false,
    fabric_waste_factor: initialData?.fabric_waste_factor || 0,
    pattern_repeat_factor: initialData?.pattern_repeat_factor || 0,
    seam_complexity_factor: initialData?.seam_complexity_factor || 0,
    sort_order: initialData?.sort_order || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Heading, Lining"
            required
          />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
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

      <div>
        <Label>Calculation Method</Label>
        <Select
          value={formData.calculation_method}
          onValueChange={(value) => setFormData(prev => ({ ...prev, calculation_method: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Price</SelectItem>
            <SelectItem value="per-meter">Per Meter</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="per-sqm">Per Square Meter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="affects_fabric"
              checked={formData.affects_fabric_calculation}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_fabric_calculation: checked }))}
            />
            <Label htmlFor="affects_fabric">Affects Fabric Calculation</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="affects_labor"
              checked={formData.affects_labor_calculation}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_labor_calculation: checked }))}
            />
            <Label htmlFor="affects_labor">Affects Labor Calculation</Label>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <Label>Fabric Waste Factor</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.fabric_waste_factor}
              onChange={(e) => setFormData(prev => ({ ...prev, fabric_waste_factor: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <Label>Pattern Repeat Factor</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.pattern_repeat_factor}
              onChange={(e) => setFormData(prev => ({ ...prev, pattern_repeat_factor: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Category
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
