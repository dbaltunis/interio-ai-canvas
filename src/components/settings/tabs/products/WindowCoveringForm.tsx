
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface WindowCovering {
  id: string;
  name: string;
  description?: string;
  base_making_cost: number;
  fabric_calculation_method: 'standard' | 'pleated' | 'gathered';
  fabric_multiplier: number;
  margin_percentage: number;
  active: boolean;
}

interface WindowCoveringFormProps {
  windowCovering?: WindowCovering;
  onSave: (windowCovering: WindowCovering) => void;
  onCancel: () => void;
  isEditing: boolean;
}

interface FormData {
  name: string;
  description: string;
  base_making_cost: number;
  fabric_calculation_method: 'standard' | 'pleated' | 'gathered';
  fabric_multiplier: number;
  margin_percentage: number;
  active: boolean;
}

export const WindowCoveringForm = ({ windowCovering, onSave, onCancel, isEditing }: WindowCoveringFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    base_making_cost: 0,
    fabric_calculation_method: 'standard',
    fabric_multiplier: 1.0,
    margin_percentage: 40.0,
    active: true
  });

  useEffect(() => {
    if (windowCovering) {
      setFormData({
        name: windowCovering.name,
        description: windowCovering.description || '',
        base_making_cost: windowCovering.base_making_cost,
        fabric_calculation_method: windowCovering.fabric_calculation_method,
        fabric_multiplier: windowCovering.fabric_multiplier,
        margin_percentage: windowCovering.margin_percentage,
        active: windowCovering.active
      });
    }
  }, [windowCovering]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Window covering name is required",
        variant: "destructive"
      });
      return;
    }

    const newWindowCovering: WindowCovering = {
      id: windowCovering?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || undefined,
      base_making_cost: formData.base_making_cost,
      fabric_calculation_method: formData.fabric_calculation_method,
      fabric_multiplier: formData.fabric_multiplier,
      margin_percentage: formData.margin_percentage,
      active: formData.active
    };

    onSave(newWindowCovering);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Window Covering' : 'Create New Window Covering'}</CardTitle>
        <CardDescription>Configure the window covering specifications and pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Roman Blind, Curtains, Roller Blind"
            />
          </div>
          <div>
            <Label htmlFor="base_making_cost">Base Making Cost (£) *</Label>
            <Input
              id="base_making_cost"
              type="number"
              step="0.01"
              value={formData.base_making_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, base_making_cost: Number(e.target.value) }))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description of the window covering..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Fabric Calculation Method</Label>
            <Select
              value={formData.fabric_calculation_method}
              onValueChange={(value: 'standard' | 'pleated' | 'gathered') => 
                setFormData(prev => ({ ...prev, fabric_calculation_method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pleated">Pleated</SelectItem>
                <SelectItem value="gathered">Gathered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric_multiplier">Fabric Multiplier</Label>
            <Input
              id="fabric_multiplier"
              type="number"
              step="0.1"
              value={formData.fabric_multiplier}
              onChange={(e) => setFormData(prev => ({ ...prev, fabric_multiplier: Number(e.target.value) }))}
              placeholder="1.0"
            />
          </div>
          <div>
            <Label htmlFor="margin_percentage">Margin Percentage (%)</Label>
            <Input
              id="margin_percentage"
              type="number"
              step="0.1"
              value={formData.margin_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, margin_percentage: Number(e.target.value) }))}
              placeholder="40.0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
            {isEditing ? 'Update Window Covering' : 'Create Window Covering'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
