
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

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
    pattern_repeat: 0, // Keep for backward compatibility
    vertical_repeat: 0,
    horizontal_repeat: 0,
    rotation_allowed: true,
    fabric_type: '',
    weight: '',
    care_instructions: '',
    supplier: '',
    fabric_code: '',
    cost_per_meter: 0,
    active: true,
    roll_direction: 'auto' // New field for roll direction
  });

  useEffect(() => {
    if (fabric) {
      setFormData({
        name: fabric.name || '',
        description: fabric.description || '',
        fabric_width: fabric.fabric_width || 137,
        pattern_repeat: fabric.pattern_repeat || 0,
        vertical_repeat: fabric.vertical_repeat || 0,
        horizontal_repeat: fabric.horizontal_repeat || 0,
        rotation_allowed: fabric.rotation_allowed !== false,
        fabric_type: fabric.fabric_type || '',
        weight: fabric.weight || '',
        care_instructions: fabric.care_instructions || '',
        supplier: fabric.supplier || '',
        fabric_code: fabric.fabric_code || '',
        cost_per_meter: fabric.cost_per_meter || 0,
        active: fabric.active !== false,
        roll_direction: fabric.roll_direction || 'auto'
      });
    }
  }, [fabric]);

  // Determine fabric classification and roll direction
  const fabricWidth = parseFloat(formData.fabric_width.toString()) || 137;
  const isNarrowFabric = fabricWidth <= 200;
  const suggestedRollDirection = isNarrowFabric ? 'vertical' : 'horizontal';
  
  // Check if fabric has patterns
  const hasVerticalRepeat = parseFloat(formData.vertical_repeat.toString()) > 0;
  const hasHorizontalRepeat = parseFloat(formData.horizontal_repeat.toString()) > 0;
  const hasPattern = hasVerticalRepeat || hasHorizontalRepeat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-set roll direction if set to auto
    const finalData = {
      ...formData,
      roll_direction: formData.roll_direction === 'auto' ? suggestedRollDirection : formData.roll_direction
    };
    onSave(finalData);
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
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isNarrowFabric ? "secondary" : "outline"} className="text-xs">
                  {isNarrowFabric ? "Narrow Fabric" : "Wide Fabric"}
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="vertical_repeat">Vertical Repeat (cm)</Label>
              <Input
                id="vertical_repeat"
                type="number"
                value={formData.vertical_repeat}
                onChange={(e) => setFormData({ ...formData, vertical_repeat: Number(e.target.value) })}
                min="0"
                step="0.1"
                placeholder="0 for no repeat"
              />
            </div>
            <div>
              <Label htmlFor="horizontal_repeat">Horizontal Repeat (cm)</Label>
              <Input
                id="horizontal_repeat"
                type="number"
                value={formData.horizontal_repeat}
                onChange={(e) => setFormData({ ...formData, horizontal_repeat: Number(e.target.value) })}
                min="0"
                step="0.1"
                placeholder="0 for no repeat"
              />
            </div>
          </div>

          {/* Pattern matching info */}
          {hasPattern && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Pattern Matching Required</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This fabric has pattern repeats and will require careful matching during fabrication.
                {hasVerticalRepeat && ` Vertical repeat: ${formData.vertical_repeat}cm.`}
                {hasHorizontalRepeat && ` Horizontal repeat: ${formData.horizontal_repeat}cm.`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="roll_direction">Roll Direction</Label>
              <Select 
                value={formData.roll_direction} 
                onValueChange={(value) => setFormData({ ...formData, roll_direction: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      Auto ({suggestedRollDirection})
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="vertical">Vertical (Narrow fabric standard)</SelectItem>
                  <SelectItem value="horizontal">Horizontal (Wide fabric standard)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                {isNarrowFabric ? "Narrow fabrics (≤200cm) typically use vertical roll direction" : "Wide fabrics (>200cm) typically use horizontal roll direction"}
              </div>
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
            {hasPattern && (
              <Badge variant="destructive" className="text-xs ml-2">
                Not recommended for patterned fabrics
              </Badge>
            )}
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
