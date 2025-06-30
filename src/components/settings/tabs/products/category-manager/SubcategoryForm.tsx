
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OptionCategory, OptionSubcategory } from "@/hooks/useWindowCoveringCategories";
import { PricingMethodInfo } from "./PricingMethodInfo";

type PricingMethod = 'per-unit' | 'per-meter' | 'per-sqm' | 'fabric-based' | 'fixed' | 'percentage';

interface SubcategoryFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (subcategory: Omit<OptionSubcategory, 'id'>) => void;
  categories: OptionCategory[];
}

export const SubcategoryForm = ({ isVisible, onClose, onSubmit, categories }: SubcategoryFormProps) => {
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    description: '',
    pricing_method: 'per-unit' as PricingMethod,
    base_price: 0,
    fullness_ratio: undefined as number | undefined,
    extra_fabric_percentage: undefined as number | undefined,
    sort_order: 0
  });

  const handleSubmit = async () => {
    const category = categories.find(c => c.id === subcategoryForm.category_id);
    await onSubmit({
      ...subcategoryForm,
      sort_order: category?.subcategories?.length || 0
    });
    setSubcategoryForm({
      category_id: '',
      name: '',
      description: '',
      pricing_method: 'per-unit' as PricingMethod,
      base_price: 0,
      fullness_ratio: undefined,
      extra_fabric_percentage: undefined,
      sort_order: 0
    });
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === subcategoryForm.category_id);
  const isHeadingCategory = selectedCategory?.name.toLowerCase().includes('heading');

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Subcategory</CardTitle>
        <CardDescription>Add a new option subcategory to an existing category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="subcategory_category">Parent Category</Label>
          <Select 
            value={subcategoryForm.category_id} 
            onValueChange={(value) => setSubcategoryForm(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subcategory_name">Subcategory Name</Label>
            <Input
              id="subcategory_name"
              value={subcategoryForm.name}
              onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Pinch Pleat, Blackout Lining"
            />
          </div>
          <div>
            <Label htmlFor="subcategory_pricing">Pricing Method</Label>
            <Select 
              value={subcategoryForm.pricing_method} 
              onValueChange={(value: PricingMethod) => setSubcategoryForm(prev => ({ ...prev, pricing_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-unit">Per Unit/Panel</SelectItem>
                <SelectItem value="per-meter">Per Linear Meter</SelectItem>
                <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                <SelectItem value="fabric-based">Fabric-Based Calculation</SelectItem>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="percentage">Percentage of Fabric Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <PricingMethodInfo pricingMethod={subcategoryForm.pricing_method} />

        <div>
          <Label htmlFor="subcategory_description">Description</Label>
          <Textarea
            id="subcategory_description"
            value={subcategoryForm.description}
            onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subcategory_price">
              Base Price (£)
              {subcategoryForm.pricing_method === 'percentage' && (
                <span className="text-xs text-gray-500 ml-1">(as %)</span>
              )}
            </Label>
            <Input
              id="subcategory_price"
              type="number"
              step={subcategoryForm.pricing_method === 'percentage' ? "1" : "0.01"}
              value={subcategoryForm.base_price}
              onChange={(e) => setSubcategoryForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          {/* Only show fullness ratio and extra fabric for heading categories */}
          {isHeadingCategory && (
            <>
              <div>
                <Label htmlFor="fullness_ratio">
                  Fullness Ratio
                  <span className="text-xs text-gray-500 ml-1">(optional)</span>
                </Label>
                <Input
                  id="fullness_ratio"
                  type="number"
                  step="0.1"
                  value={subcategoryForm.fullness_ratio || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, fullness_ratio: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 2.0"
                />
              </div>
              <div>
                <Label htmlFor="extra_fabric">
                  Extra Fabric %
                  <span className="text-xs text-gray-500 ml-1">(optional)</span>
                </Label>
                <Input
                  id="extra_fabric"
                  type="number"
                  step="1"
                  value={subcategoryForm.extra_fabric_percentage || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, extra_fabric_percentage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 10"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="bg-brand-primary hover:bg-brand-accent">
            Create Subcategory
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
