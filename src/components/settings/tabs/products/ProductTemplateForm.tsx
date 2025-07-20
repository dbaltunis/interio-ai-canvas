
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductTemplate } from "@/hooks/useProductTemplates";

interface ProductTemplateFormProps {
  template?: ProductTemplate | null;
  onSave: (templateData: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProductTemplateForm: React.FC<ProductTemplateFormProps> = ({
  template,
  onSave,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    treatment_type: "",
    product_type: "",
    product_category: "",
    calculation_method: "",
    active: true,
    components: {
      headings: {},
      lining: {},
      hardware: {}
    },
    calculation_rules: {
      labor_rate: 0,
      markup_percentage: 0,
      baseMakingCost: 0,
      baseHeightLimit: 0,
      heightSurcharge1: 0
    }
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        treatment_type: template.treatment_type || "",
        product_type: template.product_type || "",
        product_category: template.product_category || "",
        calculation_method: template.calculation_method || "",
        active: template.active ?? true,
        components: template.components || {
          headings: {},
          lining: {},
          hardware: {}
        },
        calculation_rules: template.calculation_rules || {
          labor_rate: 0,
          markup_percentage: 0,
          baseMakingCost: 0,
          baseHeightLimit: 0,
          heightSurcharge1: 0
        }
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculationRuleChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      calculation_rules: {
        ...prev.calculation_rules,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the product template details' : 'Create a new product template for window coverings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Premium Curtains"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="treatment_type">Treatment Type</Label>
              <Select value={formData.treatment_type} onValueChange={(value) => handleInputChange("treatment_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtains">Curtains</SelectItem>
                  <SelectItem value="blinds">Blinds</SelectItem>
                  <SelectItem value="shutters">Shutters</SelectItem>
                  <SelectItem value="valances">Valances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_category">Product Category</Label>
              <Select value={formData.product_category} onValueChange={(value) => handleInputChange("product_category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft-furnishing">Soft Furnishing</SelectItem>
                  <SelectItem value="hard-furnishing">Hard Furnishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="calculation_method">Calculation Method</Label>
              <Select value={formData.calculation_method} onValueChange={(value) => handleInputChange("calculation_method", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric-based">Fabric Based</SelectItem>
                  <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                  <SelectItem value="linear-meter">Linear Meter</SelectItem>
                  <SelectItem value="fixed-price">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe this template..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Calculation Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="labor_rate">Labor Rate ($/hr)</Label>
                <Input
                  id="labor_rate"
                  type="number"
                  step="0.01"
                  value={formData.calculation_rules.labor_rate}
                  onChange={(e) => handleCalculationRuleChange("labor_rate", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="markup_percentage">Markup Percentage (%)</Label>
                <Input
                  id="markup_percentage"
                  type="number"
                  step="0.1"
                  value={formData.calculation_rules.markup_percentage}
                  onChange={(e) => handleCalculationRuleChange("markup_percentage", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="baseMakingCost">Base Making Cost ($)</Label>
                <Input
                  id="baseMakingCost"
                  type="number"
                  step="0.01"
                  value={formData.calculation_rules.baseMakingCost}
                  onChange={(e) => handleCalculationRuleChange("baseMakingCost", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
            />
            <Label htmlFor="active">Active Template</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
