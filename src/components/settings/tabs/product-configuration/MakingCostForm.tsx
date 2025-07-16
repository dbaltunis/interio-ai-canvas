
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MakingCost, MakingCostFormData } from "@/hooks/useMakingCosts";
import { useProductTypes } from "@/hooks/useProductTypes";

interface MakingCostFormProps {
  makingCost?: MakingCost;
  onSave: (data: MakingCostFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const MakingCostForm = ({ makingCost, onSave, onCancel, isEditing }: MakingCostFormProps) => {
  const { productTypes } = useProductTypes();
  
  const [formData, setFormData] = useState<MakingCostFormData>({
    name: makingCost?.name || '',
    product_type_id: makingCost?.product_type_id || '',
    base_cost: makingCost?.base_cost || 0,
    cost_per_width: makingCost?.cost_per_width || 0,
    cost_per_meter: makingCost?.cost_per_meter || 0,
    cost_per_hour: makingCost?.cost_per_hour || 0,
    minimum_charge: makingCost?.minimum_charge || 0,
    complexity_multiplier: makingCost?.complexity_multiplier || 1.0,
    includes_lining: makingCost?.includes_lining ?? false,
    includes_heading: makingCost?.includes_heading ?? false,
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
              <Label htmlFor="product_type">Product Type (Optional)</Label>
              <Select
                value={formData.product_type_id || ""}
                onValueChange={(value) => setFormData({ ...formData, product_type_id: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific type</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_cost">Base Cost ($)</Label>
              <Input
                id="base_cost"
                type="number"
                step="0.01"
                value={formData.base_cost}
                onChange={(e) => setFormData({ ...formData, base_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_charge">Minimum Charge ($)</Label>
              <Input
                id="minimum_charge"
                type="number"
                step="0.01"
                value={formData.minimum_charge}
                onChange={(e) => setFormData({ ...formData, minimum_charge: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_width">Cost per Width ($)</Label>
              <Input
                id="cost_per_width"
                type="number"
                step="0.01"
                value={formData.cost_per_width}
                onChange={(e) => setFormData({ ...formData, cost_per_width: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_meter">Cost per Meter ($)</Label>
              <Input
                id="cost_per_meter"
                type="number"
                step="0.01"
                value={formData.cost_per_meter}
                onChange={(e) => setFormData({ ...formData, cost_per_meter: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_hour">Cost per Hour ($)</Label>
              <Input
                id="cost_per_hour"
                type="number"
                step="0.01"
                value={formData.cost_per_hour}
                onChange={(e) => setFormData({ ...formData, cost_per_hour: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complexity_multiplier">Complexity Multiplier</Label>
            <Input
              id="complexity_multiplier"
              type="number"
              step="0.1"
              value={formData.complexity_multiplier}
              onChange={(e) => setFormData({ ...formData, complexity_multiplier: parseFloat(e.target.value) || 1.0 })}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Included Services</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includes_lining"
                  checked={formData.includes_lining}
                  onCheckedChange={(checked) => setFormData({ ...formData, includes_lining: checked })}
                />
                <Label htmlFor="includes_lining">Includes Lining</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includes_heading"
                  checked={formData.includes_heading}
                  onCheckedChange={(checked) => setFormData({ ...formData, includes_heading: checked })}
                />
                <Label htmlFor="includes_heading">Includes Heading</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
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
