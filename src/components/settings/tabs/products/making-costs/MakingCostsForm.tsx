import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateMakingCost.mutateAsync({
          id: initialData.id,
          updates: formData
        });
      } else {
        await createMakingCost.mutateAsync(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving making cost:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Curtains, Romans, Rollers"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for this product type"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="pricing_method">Pricing Method</Label>
            <Select
              value={formData.pricing_method}
              onValueChange={(value) => handleInputChange('pricing_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                <SelectItem value="per-linear-yard">Per Linear Yard</SelectItem>
                <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                <SelectItem value="per-unit">Per Unit</SelectItem>
                <SelectItem value="fixed-price">Fixed Price</SelectItem>
                <SelectItem value="custom-grid">Custom Pricing Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="measurement_type">Measurement Type</Label>
            <Select
              value={formData.measurement_type}
              onValueChange={(value) => handleInputChange('measurement_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabric-drop-required">Fabric Drop Required</SelectItem>
                <SelectItem value="width-height-only">Width & Height Only</SelectItem>
                <SelectItem value="custom-measurements">Custom Measurements</SelectItem>
                <SelectItem value="area-based">Area Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="include_fabric_selection"
              checked={formData.include_fabric_selection}
              onCheckedChange={(checked) => handleInputChange('include_fabric_selection', checked)}
            />
            <Label htmlFor="include_fabric_selection">Include Fabric Selection</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Option Configuration</h4>
        <p className="text-sm text-muted-foreground">
          After creating this product, you'll be able to configure specific option categories (heading styles, operations, materials, etc.) 
          using the "Manage Bundled Options" button.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (initialData?.id ? 'Updating...' : 'Creating...') 
            : (initialData?.id ? 'Update Product' : 'Create Product')
          }
        </Button>
      </div>
    </form>
  );
};