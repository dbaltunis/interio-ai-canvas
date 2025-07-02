
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { type OptionCategory } from "@/hooks/useWindowCoveringCategories";

interface CategoryFormProps {
  category?: OptionCategory;
  onSave: (category: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const CategoryForm = ({ category, onSave, onCancel, isEditing }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    is_required: category?.is_required || false,
    sort_order: category?.sort_order || 0,
    image_url: category?.image_url || '',
    category_type: category?.category_type || 'general',
    has_fullness_ratio: category?.has_fullness_ratio || false,
    fullness_ratio: category?.fullness_ratio || 2.5,
    calculation_method: category?.calculation_method || 'per-unit',
    affects_fabric_calculation: category?.affects_fabric_calculation || false,
    affects_labor_calculation: category?.affects_labor_calculation || false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(category?.image_url || '');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('CategoryForm - Submitting form data:', formData);
    
    let imageUrl = formData.image_url;
    
    // For now, we'll use the preview URL. In a real app, you'd upload to storage
    if (imageFile) {
      imageUrl = imagePreview;
    }
    
    const categoryData = {
      ...formData,
      image_url: imageUrl
    };
    
    console.log('CategoryForm - Final category data:', categoryData);
    
    try {
      await onSave(categoryData);
    } catch (error) {
      console.error('CategoryForm - Error saving category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Heading, Lining, Services"
            required
          />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category Type</Label>
          <Select value={formData.category_type} onValueChange={(value) => setFormData(prev => ({ ...prev, category_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="heading">Heading</SelectItem>
              <SelectItem value="lining">Lining</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Calculation Method</Label>
          <Select value={formData.calculation_method} onValueChange={(value) => setFormData(prev => ({ ...prev, calculation_method: value as 'per-unit' | 'per-linear-meter' | 'per-linear-yard' | 'per-sqm' | 'fixed' | 'percentage' }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per-unit">Per Unit (uses quantity)</SelectItem>
              <SelectItem value="per-linear-meter">Per Linear Meter (uses rail width)</SelectItem>
              <SelectItem value="per-linear-yard">Per Linear Yard (uses rail width)</SelectItem>
              <SelectItem value="per-sqm">Per Square Meter</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="percentage">Percentage of fabric cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_required"
            checked={formData.is_required}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: !!checked }))}
          />
          <Label htmlFor="is_required">Required Category</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="affects_fabric_calculation"
              checked={formData.affects_fabric_calculation}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_fabric_calculation: !!checked }))}
            />
            <Label htmlFor="affects_fabric_calculation">Affects Fabric Calculation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="affects_labor_calculation"
              checked={formData.affects_labor_calculation}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_labor_calculation: !!checked }))}
            />
            <Label htmlFor="affects_labor_calculation">Affects Labor Calculation</Label>
          </div>
        </div>
      </div>

      {formData.category_type === 'heading' && (
        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_fullness_ratio"
              checked={formData.has_fullness_ratio}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_fullness_ratio: !!checked }))}
            />
            <Label htmlFor="has_fullness_ratio">Apply Fullness Ratio (affects fabric calculation)</Label>
          </div>
          {formData.has_fullness_ratio && (
            <div>
              <Label htmlFor="fullness_ratio">Fullness Ratio</Label>
              <Input
                id="fullness_ratio"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.fullness_ratio}
                onChange={(e) => setFormData(prev => ({ ...prev, fullness_ratio: parseFloat(e.target.value) || 2.5 }))}
                placeholder="e.g., 2.5"
              />
              <p className="text-xs text-gray-600 mt-1">
                Multiplier for fabric width calculation (e.g., 2.5 = 2.5x rail width)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Section */}
      <div>
        <Label>Category Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Category preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center w-24 h-24 flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="category-image-upload"
              />
              <label htmlFor="category-image-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">Upload</p>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
