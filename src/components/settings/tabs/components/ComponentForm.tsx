
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComponentFormProps {
  component?: any;
  componentType: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const ComponentForm = ({ component, componentType, onSave, onCancel }: ComponentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    unit: 'per-unit',
    fullness_ratio: 1,
    specifications: {},
    active: true
  });

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name || '',
        description: component.description || '',
        category: component.category || '',
        price: component.price || 0,
        unit: component.unit || 'per-unit',
        fullness_ratio: component.fullness_ratio || 1,
        specifications: component.specifications || {},
        active: component.active !== false
      });
    }
  }, [component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getCategoryOptions = () => {
    switch (componentType) {
      case 'hardware':
        return ['Track', 'Bracket', 'Motor', 'Mechanism', 'Pole', 'Finial', 'Tie-back'];
      case 'fabric_accessory':
        return ['Lining', 'Trimming', 'Border', 'Piping', 'Fringe', 'Tassel'];
      case 'heading':
        return ['Pencil Pleat', 'Pinch Pleat', 'Goblet Pleat', 'Tab Top', 'Eyelet', 'Rod Pocket'];
      case 'service':
        return ['Installation', 'Measuring', 'Delivery', 'Consultation', 'Maintenance'];
      case 'part':
        return ['Hook', 'Ring', 'Cord', 'Chain', 'Weight', 'Cleat', 'Other'];
      default:
        return [];
    }
  };

  const getUnitOptions = () => {
    return ['per-unit', 'per-meter', 'per-yard', 'per-piece', 'per-hour', 'fixed-price'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{component ? 'Edit' : 'Create'} {componentType.replace('_', ' ')} Component</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Component Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ceiling Track 3m"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions().map(option => (
                    <SelectItem key={option} value={option.toLowerCase().replace(' ', '_')}>
                      {option}
                    </SelectItem>
                  ))}
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
              placeholder="Component description and specifications"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map(option => (
                    <SelectItem key={option} value={option}>
                      {option.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {componentType === 'heading' && (
              <div>
                <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
                <Input
                  id="fullness_ratio"
                  type="number"
                  value={formData.fullness_ratio}
                  onChange={(e) => setFormData({ ...formData, fullness_ratio: Number(e.target.value) })}
                  min="1"
                  step="0.1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              {component ? 'Update' : 'Create'} Component
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
