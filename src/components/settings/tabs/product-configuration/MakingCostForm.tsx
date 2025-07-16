
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MakingCost, MakingCostFormData } from "@/hooks/useMakingCosts";

interface MakingCostFormProps {
  makingCost?: MakingCost;
  onSave: (data: MakingCostFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const MakingCostForm = ({ makingCost, onSave, onCancel, isEditing }: MakingCostFormProps) => {
  const [formData, setFormData] = useState<MakingCostFormData>({
    name: makingCost?.name || '',
    pricing_method: makingCost?.pricing_method || 'per-linear-meter',
    include_fabric_selection: makingCost?.include_fabric_selection ?? true,
    measurement_type: makingCost?.measurement_type || 'fabric-drop-required',
    heading_options: makingCost?.heading_options || [],
    hardware_options: makingCost?.hardware_options || [],
    lining_options: makingCost?.lining_options || [],
    drop_ranges: makingCost?.drop_ranges || [],
    description: makingCost?.description || '',
    active: makingCost?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Making Cost' : 'Create New Making Cost'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Making Cost Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Curtain Making"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing_method">Pricing Method</Label>
              <Select
                value={formData.pricing_method}
                onValueChange={(value) => setFormData({ ...formData, pricing_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                  <SelectItem value="per-drop">Per Drop</SelectItem>
                  <SelectItem value="per-panel">Per Panel</SelectItem>
                  <SelectItem value="pricing-grid">Pricing Grid</SelectItem>
                  <SelectItem value="fixed-price">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="measurement_type">Measurement Type</Label>
              <Select
                value={formData.measurement_type}
                onValueChange={(value) => setFormData({ ...formData, measurement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select measurement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric-drop-required">Fabric Drop Required</SelectItem>
                  <SelectItem value="width-only">Width Only</SelectItem>
                  <SelectItem value="area-based">Area Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_fabric_selection"
                  checked={formData.include_fabric_selection}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_fabric_selection: checked })}
                />
                <Label htmlFor="include_fabric_selection">Include Fabric Selection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              {isEditing ? 'Update' : 'Create'} Making Cost
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
