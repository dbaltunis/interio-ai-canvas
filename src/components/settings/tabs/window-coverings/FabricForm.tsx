
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FabricFormProps {
  fabric?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const FabricForm = ({ fabric, onSave, onCancel }: FabricFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fabric_width: 137,
    pattern_repeat: 0,
    rotation_allowed: true,
    fabric_type: '',
    weight: '',
    care_instructions: '',
    supplier: '',
    fabric_code: '',
    cost_per_meter: 0,
    active: true
  });

  useEffect(() => {
    if (fabric) {
      setFormData({
        name: fabric.name || '',
        description: fabric.description || '',
        fabric_width: fabric.fabric_width || 137,
        pattern_repeat: fabric.pattern_repeat || 0,
        rotation_allowed: fabric.rotation_allowed !== false,
        fabric_type: fabric.fabric_type || '',
        weight: fabric.weight || '',
        care_instructions: fabric.care_instructions || '',
        supplier: fabric.supplier || '',
        fabric_code: fabric.fabric_code || '',
        cost_per_meter: fabric.cost_per_meter || 0,
        active: fabric.active !== false
      });
    }
  }, [fabric]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fabric ? 'Edit' : 'Create'} Fabric</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Fabric Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cotton Voile Natural"
                required
              />
            </div>
            <div>
              <Label htmlFor="fabric_code">Fabric Code</Label>
              <Input
                id="fabric_code"
                value={formData.fabric_code}
                onChange={(e) => setFormData({ ...formData, fabric_code: e.target.value })}
                placeholder="e.g., CV-NAT-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fabric description, color, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fabric_width">Width (cm)</Label>
              <Input
                id="fabric_width"
                type="number"
                value={formData.fabric_width}
                onChange={(e) => setFormData({ ...formData, fabric_width: Number(e.target.value) })}
                min="1"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="pattern_repeat">Pattern Repeat (cm)</Label>
              <Input
                id="pattern_repeat"
                type="number"
                value={formData.pattern_repeat}
                onChange={(e) => setFormData({ ...formData, pattern_repeat: Number(e.target.value) })}
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="cost_per_meter">Cost per Meter</Label>
              <Input
                id="cost_per_meter"
                type="number"
                value={formData.cost_per_meter}
                onChange={(e) => setFormData({ ...formData, cost_per_meter: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fabric_type">Fabric Type</Label>
              <Select 
                value={formData.fabric_type} 
                onValueChange={(value) => setFormData({ ...formData, fabric_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                  <SelectItem value="silk">Silk</SelectItem>
                  <SelectItem value="polyester">Polyester</SelectItem>
                  <SelectItem value="wool">Wool</SelectItem>
                  <SelectItem value="blend">Blend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Select 
                value={formData.weight} 
                onValueChange={(value) => setFormData({ ...formData, weight: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="rotation_allowed"
              checked={formData.rotation_allowed}
              onCheckedChange={(checked) => setFormData({ ...formData, rotation_allowed: checked })}
            />
            <Label htmlFor="rotation_allowed">Allow 90° rotation for pattern matching</Label>
          </div>

          <div>
            <Label htmlFor="care_instructions">Care Instructions</Label>
            <Textarea
              id="care_instructions"
              value={formData.care_instructions}
              onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
              placeholder="Washing and care instructions"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              {fabric ? 'Update' : 'Create'} Fabric
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
