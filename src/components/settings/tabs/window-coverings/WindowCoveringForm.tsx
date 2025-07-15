
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WindowCoveringFormProps {
  windowCovering?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const WindowCoveringForm = ({ windowCovering, onSave, onCancel }: WindowCoveringFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fabrication_pricing_method: 'linear_meter',
    margin_percentage: 40,
    minimum_width: 30,
    maximum_width: 600,
    minimum_height: 30,
    maximum_height: 400,
    active: true
  });

  useEffect(() => {
    if (windowCovering) {
      setFormData({
        name: windowCovering.name || '',
        description: windowCovering.description || '',
        fabrication_pricing_method: windowCovering.fabrication_pricing_method || 'linear_meter',
        margin_percentage: windowCovering.margin_percentage || 40,
        minimum_width: windowCovering.minimum_width || 30,
        maximum_width: windowCovering.maximum_width || 600,
        minimum_height: windowCovering.minimum_height || 30,
        maximum_height: windowCovering.maximum_height || 400,
        active: windowCovering.active !== false
      });
    }
  }, [windowCovering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{windowCovering ? 'Edit' : 'Create'} Window Covering</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Curtains, Blinds, Shutters"
                required
              />
            </div>
            <div>
              <Label htmlFor="fabrication_pricing_method">Pricing Method</Label>
              <Select 
                value={formData.fabrication_pricing_method} 
                onValueChange={(value) => setFormData({ ...formData, fabrication_pricing_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear_meter">Linear Meter</SelectItem>
                  <SelectItem value="per_drop">Per Drop</SelectItem>
                  <SelectItem value="per_panel">Per Panel</SelectItem>
                  <SelectItem value="pricing_grid">Pricing Grid</SelectItem>
                  <SelectItem value="fixed_price">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of this window covering type"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="margin_percentage">Margin %</Label>
              <Input
                id="margin_percentage"
                type="number"
                value={formData.margin_percentage}
                onChange={(e) => setFormData({ ...formData, margin_percentage: Number(e.target.value) })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="minimum_width">Min Width (cm)</Label>
              <Input
                id="minimum_width"
                type="number"
                value={formData.minimum_width}
                onChange={(e) => setFormData({ ...formData, minimum_width: Number(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="maximum_width">Max Width (cm)</Label>
              <Input
                id="maximum_width"
                type="number"
                value={formData.maximum_width}
                onChange={(e) => setFormData({ ...formData, maximum_width: Number(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="minimum_height">Min Height (cm)</Label>
              <Input
                id="minimum_height"
                type="number"
                value={formData.minimum_height}
                onChange={(e) => setFormData({ ...formData, minimum_height: Number(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="maximum_height">Max Height (cm)</Label>
              <Input
                id="maximum_height"
                type="number"
                value={formData.maximum_height}
                onChange={(e) => setFormData({ ...formData, maximum_height: Number(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              {windowCovering ? 'Update' : 'Create'} Window Covering
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
