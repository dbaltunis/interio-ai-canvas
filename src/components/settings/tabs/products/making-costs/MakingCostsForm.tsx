import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCreateMakingCost, useUpdateMakingCost } from "@/hooks/useMakingCosts";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
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
  const createMakingCost = useCreateMakingCost();
  const updateMakingCost = useUpdateMakingCost();
  const { data: templates = [] } = useCurtainTemplates();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    product_type: initialData?.product_type || 'curtains',
    template_id: initialData?.template_id || '',
    pricing_method: initialData?.pricing_method || 'per_metre',
    measurement_type: initialData?.measurement_type || 'standard',
    base_price: initialData?.base_price || 0,
    labor_cost: initialData?.labor_cost || 0,
    waste_factor: initialData?.waste_factor || 5,
    minimum_charge: initialData?.minimum_charge || 0,
    markup_percentage: initialData?.markup_percentage || 50,
    options: initialData?.options || {},
    active: initialData?.active !== undefined ? initialData.active : true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    if (!formData.name.trim()) {
      console.log("Validation failed: name is required");
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
        await updateMakingCost.mutateAsync({ id: initialData.id, ...formData });
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
            <Label htmlFor="name">Making Cost Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Premium Curtains, Budget Romans"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of this making cost configuration"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="template_id">Base Template *</Label>
            <Select
              value={formData.template_id}
              onValueChange={(value) => handleInputChange('template_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.heading_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This will inherit structure and manufacturing settings from the selected template
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="base_price">Base Material Price</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="labor_cost">Labor Cost</Label>
            <Input
              id="labor_cost"
              type="number"
              step="0.01"
              value={formData.labor_cost}
              onChange={(e) => handleInputChange('labor_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="markup_percentage">Markup Percentage (%)</Label>
            <Input
              id="markup_percentage"
              type="number"
              step="5"
              value={formData.markup_percentage}
              onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
              placeholder="50"
            />
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
        <h4 className="font-medium mb-2">How It Works</h4>
        <p className="text-sm text-muted-foreground">
          This making cost will combine the selected template's structure (measurements, allowances) with your pricing (materials + labor + markup). 
          After creation, you can configure which option categories are included using "Manage Bundled Options".
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log("Cancel button clicked");
            onCancel();
          }}
          className="pointer-events-auto z-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="pointer-events-auto z-50"
        >
          {isSubmitting 
            ? (initialData?.id ? 'Updating...' : 'Creating...') 
            : (initialData?.id ? 'Update Product' : 'Create Product')
          }
        </Button>
      </div>
    </form>
  );
};