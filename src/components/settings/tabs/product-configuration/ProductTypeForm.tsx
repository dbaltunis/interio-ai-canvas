
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType, ProductTypeFormData } from "@/hooks/useProductTypes";

interface ProductTypeFormProps {
  productType?: ProductType;
  onSave: (data: ProductTypeFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProductTypeForm = ({ productType, onSave, onCancel, isEditing }: ProductTypeFormProps) => {
  const [formData, setFormData] = useState<ProductTypeFormData>({
    name: productType?.name || '',
    category: productType?.category || 'curtain',
    description: productType?.description || '',
    default_calculation_method: productType?.default_calculation_method || 'per_width',
    default_fullness_ratio: productType?.default_fullness_ratio || 2.0,
    requires_track_measurement: productType?.requires_track_measurement ?? true,
    requires_drop_measurement: productType?.requires_drop_measurement ?? true,
    requires_pattern_repeat: productType?.requires_pattern_repeat ?? true,
    default_waste_percentage: productType?.default_waste_percentage || 10.0,
    default_hem_allowance: productType?.default_hem_allowance || 15.0,
    default_seam_allowance: productType?.default_seam_allowance || 1.5,
    image_url: productType?.image_url || '',
    active: productType?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product Type' : 'Create New Product Type'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Type Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Traditional Curtains"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtain">Curtain</SelectItem>
                  <SelectItem value="blind">Blind</SelectItem>
                  <SelectItem value="roman">Roman Blind</SelectItem>
                  <SelectItem value="roller">Roller Blind</SelectItem>
                  <SelectItem value="venetian">Venetian Blind</SelectItem>
                  <SelectItem value="vertical">Vertical Blind</SelectItem>
                  <SelectItem value="panel">Panel Blind</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this product type..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calculation_method">Calculation Method</Label>
              <Select
                value={formData.default_calculation_method}
                onValueChange={(value) => setFormData({ ...formData, default_calculation_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_width">Per Width</SelectItem>
                  <SelectItem value="per_meter">Per Meter</SelectItem>
                  <SelectItem value="fixed_rate">Fixed Rate</SelectItem>
                  <SelectItem value="tiered">Tiered Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullness_ratio">Default Fullness Ratio</Label>
              <Input
                id="fullness_ratio"
                type="number"
                step="0.1"
                value={formData.default_fullness_ratio}
                onChange={(e) => setFormData({ ...formData, default_fullness_ratio: parseFloat(e.target.value) || 2.0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waste_percentage">Waste Percentage (%)</Label>
              <Input
                id="waste_percentage"
                type="number"
                step="0.1"
                value={formData.default_waste_percentage}
                onChange={(e) => setFormData({ ...formData, default_waste_percentage: parseFloat(e.target.value) || 10.0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hem_allowance">Hem Allowance (cm)</Label>
              <Input
                id="hem_allowance"
                type="number"
                step="0.1"
                value={formData.default_hem_allowance}
                onChange={(e) => setFormData({ ...formData, default_hem_allowance: parseFloat(e.target.value) || 15.0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seam_allowance">Seam Allowance (cm)</Label>
              <Input
                id="seam_allowance"
                type="number"
                step="0.1"
                value={formData.default_seam_allowance}
                onChange={(e) => setFormData({ ...formData, default_seam_allowance: parseFloat(e.target.value) || 1.5 })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Measurement Requirements</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="track_measurement"
                  checked={formData.requires_track_measurement}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_track_measurement: checked })}
                />
                <Label htmlFor="track_measurement">Requires Track Measurement</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="drop_measurement"
                  checked={formData.requires_drop_measurement}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_drop_measurement: checked })}
                />
                <Label htmlFor="drop_measurement">Requires Drop Measurement</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pattern_repeat"
                  checked={formData.requires_pattern_repeat}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_pattern_repeat: checked })}
                />
                <Label htmlFor="pattern_repeat">Requires Pattern Repeat</Label>
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
              {isEditing ? 'Update' : 'Create'} Product Type
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
